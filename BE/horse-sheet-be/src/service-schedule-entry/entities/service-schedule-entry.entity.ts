import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Stable } from '../../stable/entities/stable.entity';
import { Service } from '../../service/entities/service.entity';
import { ServiceScheduleEntryDetails } from './service-schedule-entry-details.entity';

@Entity('service_schedule_entries')
export class ServiceScheduleEntry extends BaseEntity {
  @Column({ type: 'uuid' })
  stableId: string;

  @ManyToOne(() => Stable)
  @JoinColumn({ name: 'stableId' })
  stable: Stable;

  @Column({ type: 'date' })
  date: Date; // start day

  @Column({ type: 'varchar', length: 50 })
  duration: string; // day / month / ...

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @OneToMany(
    () => ServiceScheduleEntryDetails,
    (serviceScheduleEntryDetails) => serviceScheduleEntryDetails.serviceScheduleEntry,
  )
  serviceScheduleEntryDetails: ServiceScheduleEntryDetails[];
}
