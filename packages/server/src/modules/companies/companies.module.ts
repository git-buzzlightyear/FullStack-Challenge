import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CompanySchema } from './companies.schema.js';
import { CompaniesController } from './companies.controller.js';
import { CompaniesService } from './companies.service.js';
import { QueueModule } from '../queue/queue.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Company', schema: CompanySchema }]),
    QueueModule,
    HttpModule
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
