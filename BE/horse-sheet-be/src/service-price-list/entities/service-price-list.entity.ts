import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Stable } from '../../stable/entities/stable.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('service_price_lists')
export class ServicePriceList extends BaseEntity {
  @Column({ type: 'uuid' })
  stableId: string;

  @ManyToOne(() => Stable)
  @JoinColumn({ name: 'stableId' })
  stable: Stable;

  @Column({ type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
