import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Stable } from '../../stable/entities/stable.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Activity } from '../../activity/entities/activity.entity';
import { ScheduleEntryParticipant } from './schedule-entry-participant.entity';

@Entity('schedule_entries')
export class ScheduleEntry extends BaseEntity {
  @Column({ type: 'uuid' })
  stableId: string;

  @ManyToOne(() => Stable)
  @JoinColumn({ name: 'stableId' })
  stable: Stable;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  time: string;

  @Column({ type: 'uuid' })
  instructorId: string;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructorId' })
  instructor: Instructor;

  @Column({ type: 'uuid' })
  activityId: string;

  @ManyToOne(() => Activity)
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @OneToMany(
    () => ScheduleEntryParticipant,
    (scheduleEntryParticipant) => scheduleEntryParticipant.scheduleEntry,
  )
  scheduleEntryParticipants: ScheduleEntryParticipant[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
