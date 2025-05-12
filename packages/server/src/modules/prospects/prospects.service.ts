import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ProspectDocument } from './prospects.schema';
import { Company, CompanyDocument }  from '../companies/companies.schema';

@Injectable()
export class ProspectsService {
  constructor(
    @InjectModel('Prospect')
    private readonly prospectModel: Model<ProspectDocument>,

    @InjectModel('Company')
    private readonly companyModel: Model<CompanyDocument>
  ) {}

  async toggle(userId: string, companyId: string): Promise<import('mongoose').Document | null> {
    const existing = await this.prospectModel.findOne({ userId, companyId });
    if (existing) {
      await existing.deleteOne();
      return null;
    }
    return this.prospectModel.create({ userId, companyId });
  }

  async list(userId: string): Promise<Company[]> {
    // 1) Fetch all prospects, newest first
    const prospects = await this.prospectModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean<Array<{ companyId: string }>>()
      .exec();

    const companyIds = prospects.map(p => p.companyId);
    if (companyIds.length === 0) {
      return [];
    }

    // 2) Pull the full Company documents in one go
    const companies = await this.companyModel
      .find({ id: { $in: companyIds } })
      .lean<Array<Company>>()
      .exec();

    // 3) Reorder to match the save chronology
    const mapById = new Map(companies.map(c => [c.id, c]));
    return companyIds
      .map(id => mapById.get(id))
      .filter((c): c is Company => !!c);
  }
}
