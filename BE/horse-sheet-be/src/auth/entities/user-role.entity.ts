import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @PrimaryColumn({ type: 'uuid', name: 'role_id' })
  roleId: string;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ type: 'timestamptz', name: 'assigned_at' })
  assignedAt: Date;
}

