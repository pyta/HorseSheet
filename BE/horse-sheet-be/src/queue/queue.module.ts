import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BalanceQueueProcessor } from './balance-queue.processor';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [BalanceModule],
  providers: [QueueService, BalanceQueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}

