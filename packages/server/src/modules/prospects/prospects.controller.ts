import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ProspectsService } from './prospects.service.js';

function getUserId(req: any): string {
  return req.headers['x-user'] ?? 'demo-user';
}

@Controller('prospects')
@UseInterceptors(ClassSerializerInterceptor)
export class ProspectsController {
  constructor(private readonly svc: ProspectsService) {}

  /** GET /prospects  → list of saved companies for current user */
  @Get()
  async list(@Req() req: any) {
    const userId = getUserId(req);
    return this.svc.list(userId);
  }

  /**
   * POST /prospects/:companyId  → toggle saved/unsaved.
   * Returns { saved: boolean } where “true” means it’s now saved.
   */
  @Post(':companyId')
  async toggle(@Param('companyId') companyId: string, @Req() req: any) {
    const userId = getUserId(req);
    const result = await this.svc.toggle(userId, companyId);
    // if toggle removed an existing doc, result == undefined
    return { saved: !!result };
  }
}
