import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'enrich',
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
