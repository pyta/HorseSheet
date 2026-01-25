import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { UserRole } from '../auth/entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'passwordHash' | 'userRoles'> & { roles: Role[] }> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password with bcrypt (12 rounds as per US-5 spec)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email: createUserDto.email.toLowerCase(),
      passwordHash,
      firstName: createUserDto.firstName || null,
      lastName: createUserDto.lastName || null,
      isActive: createUserDto.isActive ?? true,
    });

    const savedUser = await this.userRepository.save(user);

    // Assign roles if provided
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      await this.assignRoles(savedUser.id, createUserDto.roleIds);
    }

    // Return user with roles (transformed)
    return this.findOne(savedUser.id);
  }

  async findAll(): Promise<(Omit<User, 'passwordHash' | 'userRoles'> & { roles: Role[] })[]> {
    const users = await this.userRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['userRoles', 'userRoles.role'],
      order: { createdAt: 'DESC' },
    });
    return users.map((user) => this.transformUser(user));
  }

  async findOne(id: string): Promise<Omit<User, 'passwordHash' | 'userRoles'> & { roles: Role[] }> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.transformUser(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'passwordHash' | 'userRoles'> & { roles: Role[] }> {
    // Fetch the full user entity (not the transformed version) for updating
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Optimistic locking check
    if (updateUserDto.version !== undefined && user.version !== updateUserDto.version) {
      throw new ConflictException(
        'The user has been modified by another user. Please refresh and try again.',
      );
    }

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email.toLowerCase() !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      user.email = updateUserDto.email.toLowerCase();
    }

    // Update password if provided
    if (updateUserDto.password) {
      const saltRounds = 12;
      user.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Update other fields
    if (updateUserDto.firstName !== undefined) {
      user.firstName = updateUserDto.firstName || null;
    }
    if (updateUserDto.lastName !== undefined) {
      user.lastName = updateUserDto.lastName || null;
    }
    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }

    await this.userRepository.save(user);

    // Update roles if provided
    if (updateUserDto.roleIds !== undefined) {
      await this.updateRoles(id, updateUserDto.roleIds);
    }

    // Return updated user with roles
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.softRemove(user);
  }

  private async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    // Validate that all roles exist
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds), deletedAt: IsNull() },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid');
    }

    // Remove existing roles
    await this.userRoleRepository.delete({ userId });

    // Assign new roles
    const userRoles = roleIds.map((roleId) =>
      this.userRoleRepository.create({
        userId,
        roleId,
      }),
    );

    await this.userRoleRepository.save(userRoles);
  }

  private async updateRoles(userId: string, roleIds: string[]): Promise<void> {
    await this.assignRoles(userId, roleIds);
  }

  private transformUser(user: User): Omit<User, 'passwordHash' | 'userRoles'> & { roles: Role[] } {
    // Transform userRoles to roles array for frontend compatibility
    const roles = user.userRoles
      ?.map((userRole) => userRole.role)
      .filter((role) => role !== null && role !== undefined) || [];

    // Create a new object without passwordHash and userRoles, but with roles
    const { passwordHash, userRoles, ...userWithoutSensitive } = user;
    return {
      ...userWithoutSensitive,
      roles,
    };
  }
}

