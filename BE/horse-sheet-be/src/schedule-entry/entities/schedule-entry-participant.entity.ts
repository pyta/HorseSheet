import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ScheduleEntry } from './schedule-entry.entity';
import { Participant } from '../../participant/entities/participant.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('schedule_entry_participants')
export class ScheduleEntryParticipant extends BaseEntity {
  @Column({ type: 'uuid' })
  scheduleEntryId: string;

  @ManyToOne(() => ScheduleEntry, (scheduleEntry) => scheduleEntry.scheduleEntryParticipants)
  @JoinColumn({ name: 'scheduleEntryId' })
  scheduleEntry: ScheduleEntry;

  @Column({ type: 'uuid' })
  participantId: string;

  @ManyToOne(() => Participant)
  @JoinColumn({ name: 'participantId' })
  participant: Participant;

  @Column({ type: 'uuid', nullable: true })
  serviceId: string | null;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'serviceId' })
  service: Service | null;
}
