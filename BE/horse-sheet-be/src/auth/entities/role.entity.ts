import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from './user-role.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  @Index('IDX_roles_code', { unique: true })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}

