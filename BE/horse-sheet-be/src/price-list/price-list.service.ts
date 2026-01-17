import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PriceList } from './entities/price-list.entity';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Service } from '../service/entities/service.entity';

@Injectable()
export class PriceListService {
  constructor(
    @InjectRepository(PriceList)
    private readonly priceListRepository: Repository<PriceList>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createPriceListDto: CreatePriceListDto): Promise<PriceList> {
    // Validate that either activityId or serviceId is provided, but not both
    if (!createPriceListDto.activityId && !createPriceListDto.serviceId) {
      throw new BadRequestException(
        'Either activityId or serviceId must be provided',
      );
    }

    if (createPriceListDto.activityId && createPriceListDto.serviceId) {
      throw new BadRequestException(
        'Cannot provide both activityId and serviceId',
      );
    }

    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createPriceListDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createPriceListDto.stableId} not found or inactive`,
      );
    }

    // Validate activity if provided
    if (createPriceListDto.activityId) {
      const activity = await this.activityRepository.findOne({
        where: {
          id: createPriceListDto.activityId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!activity) {
        throw new BadRequestException(
          `Activity with ID ${createPriceListDto.activityId} not found or inactive`,
        );
      }
    }

    // Validate service if provided
    if (createPriceListDto.serviceId) {
      const service = await this.serviceRepository.findOne({
        where: {
          id: createPriceListDto.serviceId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!service) {
        throw new BadRequestException(
          `Service with ID ${createPriceListDto.serviceId} not found or inactive`,
        );
      }
    }

    const priceList = this.priceListRepository.create({
      ...createPriceListDto,
      currency: createPriceListDto.currency || 'PLN',
      isActive: createPriceListDto.isActive ?? true,
    });
    return await this.priceListRepository.save(priceList);
  }

  async findAll(): Promise<PriceList[]> {
    return await this.priceListRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: ['stable', 'activity', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PriceList> {
    const priceList = await this.priceListRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable', 'activity', 'service'],
    });

    if (!priceList) {
      throw new NotFoundException(`Price list entry with ID ${id} not found`);
    }

    return priceList;
  }

  async update(
    id: string,
    updatePriceListDto: UpdatePriceListDto,
  ): Promise<PriceList> {
    const priceList = await this.findOne(id);

    // Optimistic locking check
    if (
      updatePriceListDto.version !== undefined &&
      priceList.version !== updatePriceListDto.version
    ) {
      throw new ConflictException(
        'The price list entry has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate activity/service if updating
    if (updatePriceListDto.activityId) {
      const activity = await this.activityRepository.findOne({
        where: {
          id: updatePriceListDto.activityId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!activity) {
        throw new BadRequestException(
          `Activity with ID ${updatePriceListDto.activityId} not found or inactive`,
        );
      }
    }

    if (updatePriceListDto.serviceId) {
      const service = await this.serviceRepository.findOne({
        where: {
          id: updatePriceListDto.serviceId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!service) {
        throw new BadRequestException(
          `Service with ID ${updatePriceListDto.serviceId} not found or inactive`,
        );
      }
    }

    Object.assign(priceList, updatePriceListDto);
    return await this.priceListRepository.save(priceList);
  }

  async remove(id: string): Promise<void> {
    const priceList = await this.findOne(id);
    await this.priceListRepository.softRemove(priceList);
  }
}
