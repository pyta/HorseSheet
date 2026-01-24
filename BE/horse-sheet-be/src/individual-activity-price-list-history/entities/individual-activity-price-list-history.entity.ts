import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Stable } from '../../stable/entities/stable.entity';
import { Activity } from '../../activity/entities/activity.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Participant } from '../../participant/entities/participant.entity';

@Entity('individual_activity_price_list_histories')
export class IndividualActivityPriceListHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  stableId: string;

  @ManyToOne(() => Stable)
  @JoinColumn({ name: 'stableId' })
  stable: Stable;

  @Column({ type: 'uuid', nullable: true })
  activityId: string | null;

  @ManyToOne(() => Activity, { nullable: true })
  @JoinColumn({ name: 'activityId' })
  activity: Activity | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  @Column({ type: 'uuid' })
  instructorId: string;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructorId' })
  instructor: Instructor;

  @Column({ type: 'uuid' })
  participantId: string;

  @ManyToOne(() => Participant)
  @JoinColumn({ name: 'participantId' })
  participant: Participant;

  @Column({ type: 'date' })
  dateFrom: Date;

  @Column({ type: 'date', nullable: true })
  dateTo: Date | null;
}

