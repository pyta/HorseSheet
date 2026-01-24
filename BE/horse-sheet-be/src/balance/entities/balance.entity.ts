import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ContactPerson } from '../../contact-person/entities/contact-person.entity';

@Entity('balances')
export class Balance extends BaseEntity {
  @Column({ type: 'uuid' })
  contactPersonId: string;

  @ManyToOne(() => ContactPerson)
  @JoinColumn({ name: 'contactPersonId' })
  contactPerson: ContactPerson;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;
}

