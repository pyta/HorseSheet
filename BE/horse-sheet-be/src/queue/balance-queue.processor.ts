import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { BalanceService } from '../balance/balance.service';
import { BalanceQueueMessage } from './queue.service';

@Injectable()
export class BalanceQueueProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker<BalanceQueueMessage>;
  private connectionOptions: {
    host: string;
    port: number;
    maxRetriesPerRequest: number | null;
  };

  constructor(
    private configService: ConfigService,
    private balanceService: BalanceService,
  ) {}

  onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    this.connectionOptions = {
      host: redisHost,
      port: redisPort,
      ...(redisPassword && { password: redisPassword }),
      maxRetriesPerRequest: null,
    };

    this.worker = new Worker<BalanceQueueMessage>(
      'balance',
      async (job: Job<BalanceQueueMessage>) => {
        const { value, contactPersonId } = job.data;
        await this.balanceService.updateBalanceByContactPersonId(
          contactPersonId,
          value,
        );
      },
      {
        connection: this.connectionOptions,
      },
    );

    this.worker.on('completed', (job) => {
      console.log(`Balance update job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Balance update job ${job?.id} failed:`, err);
    });
  }

  onModuleDestroy() {
    if (this.worker) {
      this.worker.close();
    }
  }
}

