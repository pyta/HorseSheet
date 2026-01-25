import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { UserRole } from '../auth/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

