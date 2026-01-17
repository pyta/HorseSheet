import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Stable } from '../stable/entities/stable.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createActivityDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createActivityDto.stableId} not found or inactive`,
      );
    }

    const activity = this.activityRepository.create({
      ...createActivityDto,
      isActive: createActivityDto.isActive ?? true,
    });
    return await this.activityRepository.save(activity);
  }

  async findAll(): Promise<Activity[]> {
    return await this.activityRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: ['stable'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    const activity = await this.findOne(id);

    // Optimistic locking check
    if (
      updateActivityDto.version !== undefined &&
      activity.version !== updateActivityDto.version
    ) {
      throw new ConflictException(
        'The activity has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate stable if updating
    if (updateActivityDto.stableId) {
      const stable = await this.stableRepository.findOne({
        where: { id: updateActivityDto.stableId, deletedAt: IsNull() },
      });

      if (!stable) {
        throw new BadRequestException(
          `Stable with ID ${updateActivityDto.stableId} not found or inactive`,
        );
      }
    }

    Object.assign(activity, updateActivityDto);
    return await this.activityRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    await this.activityRepository.softRemove(activity);
  }
}
