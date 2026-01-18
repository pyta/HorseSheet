import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ActivityScheduleEntry } from './activity-schedule-entry.entity';
import { Participant } from '../../participant/entities/participant.entity';

@Entity('activity_schedule_entry_details')
export class ActivityScheduleEntryDetails extends BaseEntity {
  @Column({ type: 'uuid' })
  activityScheduleEntryId: string;

  @ManyToOne(() => ActivityScheduleEntry, (activityScheduleEntry) => activityScheduleEntry.activityScheduleEntryDetails)
  @JoinColumn({ name: 'activityScheduleEntryId' })
  activityScheduleEntry: ActivityScheduleEntry;

  @Column({ type: 'uuid' })
  participantId: string;

  @ManyToOne(() => Participant)
  @JoinColumn({ name: 'participantId' })
  participant: Participant;
}
