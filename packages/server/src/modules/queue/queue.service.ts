import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('enrich') private readonly queue: Queue) {}

  async enqueueScrape(companyId: string) {
    await this.queue.add('enrich-company', { companyId });
  }
}
