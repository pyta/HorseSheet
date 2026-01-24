import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceScheduleEntryService } from './service-schedule-entry.service';
import { ServiceScheduleEntryController } from './service-schedule-entry.controller';
import { ServiceScheduleEntry } from './entities/service-schedule-entry.entity';
import { ServiceScheduleEntryDetails } from './entities/service-schedule-entry-details.entity';
import { Stable } from '../stable/entities/stable.entity';
import { Service } from '../service/entities/service.entity';
import { Participant } from '../participant/entities/participant.entity';
import { QueueModule } from '../queue/queue.module';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceScheduleEntry,
      ServiceScheduleEntryDetails,
      Stable,
      Service,
      Participant,
    ]),
    QueueModule,
    BalanceModule,
  ],
  controllers: [ServiceScheduleEntryController],
  providers: [ServiceScheduleEntryService],
  exports: [ServiceScheduleEntryService],
})
export class ServiceScheduleEntryModule {}
