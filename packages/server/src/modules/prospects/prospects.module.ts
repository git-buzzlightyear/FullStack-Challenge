import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProspectSchema } from './prospects.schema.js';
import { ProspectsService } from './prospects.service.js';
import { ProspectsController } from './prospects.controller.js';
import { CompanySchema } from '../companies/companies.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Prospect', schema: ProspectSchema },
      { name: 'Company', schema: CompanySchema },
    ]),
  ],
  providers: [ProspectsService],
  controllers: [ProspectsController],
  exports: [ProspectsService],
})
export class ProspectsModule {}
