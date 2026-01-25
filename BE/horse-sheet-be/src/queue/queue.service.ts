import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

export interface BalanceQueueMessage {
  value: number;
  contactPersonId: string;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private balanceQueue: Queue<BalanceQueueMessage>;
  private connectionOptions: {
    host: string;
    port: number;
    maxRetriesPerRequest: number | null;
  };

  constructor(private configService: ConfigService) {}

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

    this.balanceQueue = new Queue<BalanceQueueMessage>('balance', {
      connection: this.connectionOptions,
    });
  }

  onModuleDestroy() {
    if (this.balanceQueue) {
      this.balanceQueue.close();
    }
  }

  async addBalanceUpdate(message: BalanceQueueMessage): Promise<void> {
    await this.balanceQueue.add('update-balance', message);
  }

  getBalanceQueue(): Queue<BalanceQueueMessage> {
    return this.balanceQueue;
  }
}

