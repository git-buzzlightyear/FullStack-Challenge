import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { env } from './config/validation.js';
import { CompaniesModule } from './modules/companies/companies.module.js';
import { ProspectsModule } from './modules/prospects/prospects.module.js';
import { QueueModule } from './modules/queue/queue.module.js';

@Module({
  imports: [
    MongooseModule.forRoot(env.MONGO_URL),
    BullModule.forRoot({ connection: { url: env.REDIS_URL } }),
    CompaniesModule,
    ProspectsModule,
    QueueModule,
  ],
})
export class AppModule {}
