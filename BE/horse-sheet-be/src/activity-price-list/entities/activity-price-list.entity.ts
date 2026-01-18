import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Stable } from '../../stable/entities/stable.entity';
import { Activity } from '../../activity/entities/activity.entity';

@Entity('activity_price_lists')
export class ActivityPriceList extends BaseEntity {
  @Column({ type: 'uuid' })
  stableId: string;

  @ManyToOne(() => Stable)
  @JoinColumn({ name: 'stableId' })
  stable: Stable;

  @Column({ type: 'uuid' })
  activityId: string;

  @ManyToOne(() => Activity)
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
