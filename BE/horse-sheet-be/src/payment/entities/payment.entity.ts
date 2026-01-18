import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Stable } from '../../stable/entities/stable.entity';
import { Participant } from '../../participant/entities/participant.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ type: 'uuid' })
  stableId: string;

  @ManyToOne(() => Stable)
  @JoinColumn({ name: 'stableId' })
  stable: Stable;

  @Column({ type: 'uuid' })
  participantId: string;

  @ManyToOne(() => Participant)
  @JoinColumn({ name: 'participantId' })
  participant: Participant;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;
}
