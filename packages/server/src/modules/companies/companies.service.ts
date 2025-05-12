import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { load } from 'cheerio';
import OpenAI from 'openai';
import { QueueService } from '../queue/queue.service.js';
import { Company, CompanyDocument } from './companies.schema.js';
import { env } from '../../config/validation.js';

interface SearchParams {
  q?: string;
  country?: string;
  industry?: string;
  founded?: number;
  size?: number;
  website?: string;
  linkedin_url?: string;
  page: number;
  pageSize: number;
}

interface AISearchParams {
  query: string;
  page: number;
  pageSize: number;
}

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel('Company') private readonly model: Model<any>,
    @InjectModel('Company')
    private readonly companyModel: Model<CompanyDocument>,
    private readonly queue: QueueService,
    private readonly http: HttpService,
  ) {}

  /** Called by controller when user clicks “save to prospects” */
  async ensureSummary(companyId: string): Promise<Company> {
    const company = await this.getById(companyId);
    if (!company) throw new Error('Company not found');

    if (!company.summary) {
      await this.queue.enqueueScrape(companyId);
    }
    return company;         // return current state (summary may still be null)
  }

  /* Basic search with filters like country, industry, founded date, company size and other keywords */
  async search(params: SearchParams) {
    const {
      q,
      country,
      founded,
      industry,
      size,
      website,
      linkedin_url,
      page,
      pageSize,
    } = params;

    console.log('page', typeof page);

    console.log('pageSize', typeof pageSize);

    // 1) Build the classic field matches
    const match: any = {};
    if (q) match.$text = { $search: q };
    if (country) match.country = country;
    if (industry) match.industry = industry;
    if (website) match.website = website;
    if (linkedin_url) match.linkedin_url = linkedin_url;

    // 2) Build an $expr for founded & size filters
    const exprs: any[] = [];

    // 2a) founded (string → int, then >=)
    if (founded != null) {
      exprs.push({
        $gte: [
          { $toInt: '$founded' },   // cast string to number
          founded,                  // your numeric param
        ],
      });
    }

    // 2b) size ("min-max" or "min+") ranges
    if (size != null) {
      const parts    = { $split: ['$size', '-'] };
      const lowerStr = { $arrayElemAt: [parts, 0] };
      const upperStr = { $arrayElemAt: [parts, 1] };

      // trim any trailing '+' and cast
      const lowerNum = {
        $toInt: { $trim: { input: lowerStr, chars: '+' } },
      };
      const upperNum = {
        $toInt: { $trim: { input: upperStr, chars: '+' } },
      };

      exprs.push({
        $and: [
          // always require: lowerNum <= sizeParam
          { $lte: [lowerNum, size] },
          // if there is no dash → parts.length === 1 → allow all above lower
          // else require: sizeParam <= upperNum
          {
            $or: [
              { $eq: [{ $size: parts }, 1] },
              { $gte: [upperNum, size] },
            ],
          },
        ],
      });
    }

    // attach the combined $expr if we built any
    if (exprs.length === 1) {
      match.$expr = exprs[0];
    } else if (exprs.length > 1) {
      match.$expr = { $and: exprs };
    }

    // 3) Your existing aggregation pipeline
    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $facet: {
          data: [
            { $sort: q ? { score: { $meta: 'textScore' } } : { _id: 1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
          ],
          total: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        },
      },
    ];

    // 4) Execute and return
    const [{ data, total }] = await this.companyModel.aggregate(pipeline);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /* Basic AI based search with simple prompt */
  async basicAISearch(params: AISearchParams) {
    const { query: prompt, page, pageSize } = params;
    type CreateParams = Parameters<
      typeof openai.chat.completions.create
    >[0];
    type MessagesType = CreateParams['messages'];
    const messages: MessagesType = [
      {
        role: 'system', content:
        'You are an assistant that converts user search queries into JSON filter objects. ' +
        'Allowed fields: industry, country, size, founded, keyword. Output only valid JSON.'
      },
      { role: 'user', content: prompt }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.5,
    });

    let filters: any = {};
    try {
      filters = JSON.parse(completion.choices[0].message?.content?.trim() || '{}');
    } catch (err) {
      console.error('Failed to parse AI response as JSON', err);
      throw err;
    }

    if (filters.keyword) {
      filters = { ...filters, q: filters.keyword };
    }

    return this.search({ ...filters, page, pageSize });
  }

  /* Advanced AI based search with googling company data */
  async advancedAISearch(params: AISearchParams) {
    const { query: prompt, page, pageSize } = params;

    const textMatch = prompt ? { $text: { $search: prompt } } : {};
    const textTotal = await this.companyModel.countDocuments(textMatch);
    let textDocs = await this.companyModel
      .find(textMatch, prompt ? { score: { $meta: 'textScore' } } : {})
      .sort(prompt ? { score: { $meta: 'textScore' } } : {})
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    // If enough hits in phase 1, return immediately
    if (textDocs.length === pageSize) {
      return wrap(textDocs, textTotal, page, pageSize);
    }

    const { domains, names } = await this.scrapeDuckDuckGo(prompt);
    const orClauses: any[] = [];

    if (names.length) {
      orClauses.push({
        name: { $regex: names.map(escapeRegExp).join('|'), $options: 'i' },
      });
    }
    if (domains.length) {
      const dr = domains.map(escapeRegExp).join('|');
      orClauses.push(
        { website:     { $regex: dr, $options: 'i' } },
        { linkedin_url:{ $regex: dr, $options: 'i' } },
      );
    }
    if (!orClauses.length) {
      // ultimate fallback: regex on prompt
      orClauses.push({ name: { $regex: escapeRegExp(prompt), $options: 'i' } });
    }

    const regexMatch = { $or: orClauses };
    const regexTotal = await this.companyModel.countDocuments(regexMatch);
    const regexDocs = await this.companyModel
      .find(regexMatch)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    // Merge phase 1 + phase 2, dedupe by _id, preserving textDocs first
    const seen = new Set(textDocs.map((d) => d._id.toString()));
    const merged = [...textDocs];
    for (const doc of regexDocs) {
      if (!seen.has(doc._id.toString())) {
        merged.push(doc);
        seen.add(doc._id.toString());
        if (merged.length >= pageSize) break;
      }
    }

    // total should reflect the union size (approx)
    const totalUnion = new Set(
      [...Array(textTotal).keys()]
        .concat([...Array(regexTotal).keys()].map((i) => i + textTotal))
    ).size;

    return wrap(merged, totalUnion, page, pageSize);
  }

  /**
   * Fetch a single company by its unique `id` field.
   * Throws 404 if no such company exists.
  */
  async getById(id: string): Promise<Company> {
    const company = await this.companyModel
      .findOne({ id })
      .lean()
      .exec();

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }

  // Extract domains & names from DuckDuckGo
  private async scrapeDuckDuckGo(prompt: string) {
    const resp = await lastValueFrom(
      this.http.get<string>('https://duckduckgo.com/html/', {
        params: { q: prompt },
        responseType: 'text',
      }),
    );
    const html = typeof resp === 'string' ? resp : resp.data;
    const $ = load(html);

    const domains: string[] = [];
    const names: string[] = [];

    $('a.result__a').each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href');
      if (!href) return;
      try {
        const url = new URL(href);
        domains.push(url.hostname);
        names.push(text);
      } catch {}
    });

    return {
      domains: Array.from(new Set(domains)),
      names: Array.from(new Set(names)),
    };
  }

}

/** Utility: escape user input for safe RegExp usage */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wrap<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
