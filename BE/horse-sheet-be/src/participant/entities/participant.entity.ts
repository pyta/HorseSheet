import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Stable } from '../../stable/entities/stable.entity';
import { ContactPerson } from '../../contact-person/entities/contact-person.entity';

@Entity('participants')
export class Participant extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'uuid' })
  stableId: string;

  @ManyToOne(() => Stable)
  @JoinColumn({ name: 'stableId' })
  stable: Stable;

  @Column({ type: 'uuid' })
  defaultContactPersonId: string;

  @ManyToOne(() => ContactPerson)
  @JoinColumn({ name: 'defaultContactPersonId' })
  defaultContactPerson: ContactPerson;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
