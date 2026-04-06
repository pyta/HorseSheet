import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Stable } from './stable.entity';

@Entity('user_stables')
export class UserStable {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @PrimaryColumn({ type: 'uuid', name: 'stable_id' })
  stableId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Stable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stable_id' })
  stable: Stable;
}
