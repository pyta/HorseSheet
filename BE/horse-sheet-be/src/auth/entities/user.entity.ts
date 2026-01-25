import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 320 })
  @Index('IDX_users_email', { unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'first_name' })
  firstName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'last_name' })
  lastName: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}

