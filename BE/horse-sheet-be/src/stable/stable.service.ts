import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Stable } from './entities/stable.entity';
import { UserStable } from './entities/user-stable.entity';
import { CreateStableDto } from './dto/create-stable.dto';
import { UpdateStableDto } from './dto/update-stable.dto';

export interface RequestUser {
  userId: string;
  roles: string[];
  stableIds: string[];
}

@Injectable()
export class StableService {
  constructor(
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(UserStable)
    private readonly userStableRepository: Repository<UserStable>,
  ) {}

  async create(createStableDto: CreateStableDto, user: RequestUser): Promise<Stable> {
    const stable = this.stableRepository.create({
      ...createStableDto,
      isActive: createStableDto.isActive ?? true,
    });
    const saved = await this.stableRepository.save(stable);
    // Grant creator access (SO adds relation when creating stable)
    await this.userStableRepository.save(
      this.userStableRepository.create({ userId: user.userId, stableId: saved.id }),
    );
    return saved;
  }

  async findAll(user: RequestUser | null): Promise<Stable[]> {
    const where: any = { deletedAt: IsNull() };
    if (user && !user.roles.includes('admin')) {
      if (!user.stableIds || user.stableIds.length === 0) return [];
      where.id = In(user.stableIds);
    }
    return await this.stableRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: RequestUser | null): Promise<Stable> {
    const stable = await this.stableRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new NotFoundException(`Stable with ID ${id} not found`);
    }

    if (user && !user.roles.includes('admin') && !user.stableIds?.includes(id)) {
      throw new ForbiddenException('Access to this stable is not allowed');
    }

    return stable;
  }

  async update(id: string, updateStableDto: UpdateStableDto, user: RequestUser | null): Promise<Stable> {
    const stable = await this.findOne(id, user);

    // Optimistic locking check
    if (updateStableDto.version !== undefined && stable.version !== updateStableDto.version) {
      throw new ConflictException(
        'The stable has been modified by another user. Please refresh and try again.',
      );
    }

    Object.assign(stable, updateStableDto);
    return await this.stableRepository.save(stable);
  }

  async remove(id: string, user: RequestUser | null): Promise<void> {
    const stable = await this.findOne(id, user);
    await this.stableRepository.softRemove(stable);
  }
}
