import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ActivityPriceList } from './entities/activity-price-list.entity';
import { CreateActivityPriceListDto } from './dto/create-activity-price-list.dto';
import { UpdateActivityPriceListDto } from './dto/update-activity-price-list.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Activity } from '../activity/entities/activity.entity';

@Injectable()
export class ActivityPriceListService {
  constructor(
    @InjectRepository(ActivityPriceList)
    private readonly activityPriceListRepository: Repository<ActivityPriceList>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(createActivityPriceListDto: CreateActivityPriceListDto): Promise<ActivityPriceList> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createActivityPriceListDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createActivityPriceListDto.stableId} not found or inactive`,
      );
    }

    // Validate activity exists and is active
    const activity = await this.activityRepository.findOne({
      where: {
        id: createActivityPriceListDto.activityId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!activity) {
      throw new BadRequestException(
        `Activity with ID ${createActivityPriceListDto.activityId} not found or inactive`,
      );
    }

    const activityPriceList = this.activityPriceListRepository.create({
      ...createActivityPriceListDto,
      currency: createActivityPriceListDto.currency || 'PLN',
      isActive: createActivityPriceListDto.isActive ?? true,
    });
    return await this.activityPriceListRepository.save(activityPriceList);
  }

  async findAll(): Promise<ActivityPriceList[]> {
    return await this.activityPriceListRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: ['stable', 'activity'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ActivityPriceList> {
    const activityPriceList = await this.activityPriceListRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable', 'activity'],
    });

    if (!activityPriceList) {
      throw new NotFoundException(`Activity price list entry with ID ${id} not found`);
    }

    return activityPriceList;
  }

  async update(
    id: string,
    updateActivityPriceListDto: UpdateActivityPriceListDto,
  ): Promise<ActivityPriceList> {
    const activityPriceList = await this.findOne(id);

    // Optimistic locking check
    if (
      updateActivityPriceListDto.version !== undefined &&
      activityPriceList.version !== updateActivityPriceListDto.version
    ) {
      throw new ConflictException(
        'The activity price list entry has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate activity if updating
    if (updateActivityPriceListDto.activityId) {
      const activity = await this.activityRepository.findOne({
        where: {
          id: updateActivityPriceListDto.activityId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!activity) {
        throw new BadRequestException(
          `Activity with ID ${updateActivityPriceListDto.activityId} not found or inactive`,
        );
      }
    }

    Object.assign(activityPriceList, updateActivityPriceListDto);
    return await this.activityPriceListRepository.save(activityPriceList);
  }

  async remove(id: string): Promise<void> {
    const activityPriceList = await this.findOne(id);
    await this.activityPriceListRepository.softRemove(activityPriceList);
  }
}
