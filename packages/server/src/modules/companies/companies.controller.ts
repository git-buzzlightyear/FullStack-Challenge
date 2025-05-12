import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Company } from './companies.schema';
import { CompaniesService } from './companies.service.js';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly svc: CompaniesService) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('country') country?: string,
    @Query('industry') industry?: string,
    @Query('founded') founded?: number,
    @Query('size') size?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize = 20,
  ) {
    return this.svc.search({
      q,
      country,
      industry,
      founded,
      size,
      page,
      pageSize,
    });
  }

  @Get('basic-ai-search')
  basicAISearch(
    @Query('query') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize = 20,
  ) {
    return this.svc.basicAISearch({ query, page, pageSize });
  }

  @Get('advanced-ai-search')
  advancedAISearch(
    @Query('query') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize = 20,
  ) {
    return this.svc.advancedAISearch({ query, page, pageSize });
  }

  // (C) GET /companies/:id   (frontend polling)
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Company> {
    return this.svc.getById(id); // add a simple method or reuse Mongoose
  }

  @Get(':id/ensureSummary')
  async ensureSummary(@Param('id') id: string): Promise<Company> {
    return this.svc.ensureSummary(id);
  }
}
