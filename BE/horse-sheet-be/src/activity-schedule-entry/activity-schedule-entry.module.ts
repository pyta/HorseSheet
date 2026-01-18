import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityScheduleEntryService } from './activity-schedule-entry.service';
import { ActivityScheduleEntryController } from './activity-schedule-entry.controller';
import { ActivityScheduleEntry } from './entities/activity-schedule-entry.entity';
import { ActivityScheduleEntryDetails } from './entities/activity-schedule-entry-details.entity';
import { Stable } from '../stable/entities/stable.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Participant } from '../participant/entities/participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityScheduleEntry,
      ActivityScheduleEntryDetails,
      Stable,
      Instructor,
      Activity,
      Participant,
    ]),
  ],
  controllers: [ActivityScheduleEntryController],
  providers: [ActivityScheduleEntryService],
  exports: [ActivityScheduleEntryService],
})
export class ActivityScheduleEntryModule {}
