import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ServiceScheduleEntry } from './service-schedule-entry.entity';
import { Participant } from '../../participant/entities/participant.entity';

@Entity('service_schedule_entry_details')
export class ServiceScheduleEntryDetails extends BaseEntity {
  @Column({ type: 'uuid' })
  serviceScheduleEntryId: string;

  @ManyToOne(() => ServiceScheduleEntry, (serviceScheduleEntry) => serviceScheduleEntry.serviceScheduleEntryDetails)
  @JoinColumn({ name: 'serviceScheduleEntryId' })
  serviceScheduleEntry: ServiceScheduleEntry;

  @Column({ type: 'uuid' })
  participantId: string;

  @ManyToOne(() => Participant)
  @JoinColumn({ name: 'participantId' })
  participant: Participant;
}
