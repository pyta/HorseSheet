import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Stable } from './entities/stable.entity';
import { CreateStableDto } from './dto/create-stable.dto';
import { UpdateStableDto } from './dto/update-stable.dto';

@Injectable()
export class StableService {
  constructor(
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
  ) {}

  async create(createStableDto: CreateStableDto): Promise<Stable> {
    const stable = this.stableRepository.create({
      ...createStableDto,
      isActive: createStableDto.isActive ?? true,
    });
    return await this.stableRepository.save(stable);
  }

  async findAll(): Promise<Stable[]> {
    return await this.stableRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Stable> {
    const stable = await this.stableRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new NotFoundException(`Stable with ID ${id} not found`);
    }

    return stable;
  }

  async update(id: string, updateStableDto: UpdateStableDto): Promise<Stable> {
    const stable = await this.findOne(id);

    // Optimistic locking check
    if (updateStableDto.version !== undefined && stable.version !== updateStableDto.version) {
      throw new ConflictException(
        'The stable has been modified by another user. Please refresh and try again.',
      );
    }

    Object.assign(stable, updateStableDto);
    return await this.stableRepository.save(stable);
  }

  async remove(id: string): Promise<void> {
    const stable = await this.findOne(id);
    await this.stableRepository.softRemove(stable);
  }
}
