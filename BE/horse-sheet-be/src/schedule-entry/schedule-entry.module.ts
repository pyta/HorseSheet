import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntryService } from './schedule-entry.service';
import { ScheduleEntryController } from './schedule-entry.controller';
import { ScheduleEntry } from './entities/schedule-entry.entity';
import { ScheduleEntryParticipant } from './entities/schedule-entry-participant.entity';
import { Stable } from '../stable/entities/stable.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Participant } from '../participant/entities/participant.entity';
import { Service } from '../service/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleEntry,
      ScheduleEntryParticipant,
      Stable,
      Instructor,
      Activity,
      Participant,
      Service,
    ]),
  ],
  controllers: [ScheduleEntryController],
  providers: [ScheduleEntryService],
  exports: [ScheduleEntryService],
})
export class ScheduleEntryModule {}
