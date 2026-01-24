import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ServicePriceList } from './entities/service-price-list.entity';
import { CreateServicePriceListDto } from './dto/create-service-price-list.dto';
import { UpdateServicePriceListDto } from './dto/update-service-price-list.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Service } from '../service/entities/service.entity';
import { ServicePriceListHistory } from '../service-price-list-history/entities/service-price-list-history.entity';

@Injectable()
export class ServicePriceListService {
  constructor(
    @InjectRepository(ServicePriceList)
    private readonly servicePriceListRepository: Repository<ServicePriceList>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServicePriceListHistory)
    private readonly servicePriceListHistoryRepository: Repository<ServicePriceListHistory>,
  ) {}

  async create(createServicePriceListDto: CreateServicePriceListDto): Promise<ServicePriceList> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createServicePriceListDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createServicePriceListDto.stableId} not found or inactive`,
      );
    }

    // Validate service exists and is active
    const service = await this.serviceRepository.findOne({
      where: {
        id: createServicePriceListDto.serviceId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!service) {
      throw new BadRequestException(
        `Service with ID ${createServicePriceListDto.serviceId} not found or inactive`,
      );
    }

    const servicePriceList = this.servicePriceListRepository.create({
      ...createServicePriceListDto,
      currency: createServicePriceListDto.currency || 'PLN',
      isActive: createServicePriceListDto.isActive ?? true,
    });
    const savedPriceList = await this.servicePriceListRepository.save(servicePriceList);

    // Create history entry
    const historyEntry = this.servicePriceListHistoryRepository.create({
      stableId: savedPriceList.stableId,
      serviceId: savedPriceList.serviceId,
      price: savedPriceList.price,
      currency: savedPriceList.currency,
      isActive: savedPriceList.isActive,
      dateFrom: new Date(),
      dateTo: null,
    });
    await this.servicePriceListHistoryRepository.save(historyEntry);

    return savedPriceList;
  }

  async findAll(): Promise<ServicePriceList[]> {
    return await this.servicePriceListRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: ['stable', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ServicePriceList> {
    const servicePriceList = await this.servicePriceListRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable', 'service'],
    });

    if (!servicePriceList) {
      throw new NotFoundException(`Service price list entry with ID ${id} not found`);
    }

    return servicePriceList;
  }

  async update(
    id: string,
    updateServicePriceListDto: UpdateServicePriceListDto,
  ): Promise<ServicePriceList> {
    const servicePriceList = await this.findOne(id);

    // Optimistic locking check
    if (
      updateServicePriceListDto.version !== undefined &&
      servicePriceList.version !== updateServicePriceListDto.version
    ) {
      throw new ConflictException(
        'The service price list entry has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate service if updating
    if (updateServicePriceListDto.serviceId) {
      const service = await this.serviceRepository.findOne({
        where: {
          id: updateServicePriceListDto.serviceId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!service) {
        throw new BadRequestException(
          `Service with ID ${updateServicePriceListDto.serviceId} not found or inactive`,
        );
      }
    }

    // Check if price or isActive changed (fields that affect pricing)
    const priceChanged =
      updateServicePriceListDto.price !== undefined &&
      updateServicePriceListDto.price !== servicePriceList.price;
    const isActiveChanged =
      updateServicePriceListDto.isActive !== undefined &&
      updateServicePriceListDto.isActive !== servicePriceList.isActive;

    if (priceChanged || isActiveChanged) {
      // Close existing history entry
      const existingHistory = await this.servicePriceListHistoryRepository.findOne({
        where: {
          stableId: servicePriceList.stableId,
          serviceId: servicePriceList.serviceId,
          dateTo: IsNull(),
          deletedAt: IsNull(),
        },
        order: { dateFrom: 'DESC' },
      });

      if (existingHistory) {
        existingHistory.dateTo = new Date();
        await this.servicePriceListHistoryRepository.save(existingHistory);
      }

      // Create new history entry
      const historyEntry = this.servicePriceListHistoryRepository.create({
        stableId: servicePriceList.stableId,
        serviceId: updateServicePriceListDto.serviceId || servicePriceList.serviceId,
        price: updateServicePriceListDto.price !== undefined ? updateServicePriceListDto.price : servicePriceList.price,
        currency: updateServicePriceListDto.currency || servicePriceList.currency,
        isActive: updateServicePriceListDto.isActive !== undefined ? updateServicePriceListDto.isActive : servicePriceList.isActive,
        dateFrom: new Date(),
        dateTo: null,
      });
      await this.servicePriceListHistoryRepository.save(historyEntry);
    }

    Object.assign(servicePriceList, updateServicePriceListDto);
    return await this.servicePriceListRepository.save(servicePriceList);
  }

  async remove(id: string): Promise<void> {
    const servicePriceList = await this.findOne(id);
    await this.servicePriceListRepository.softRemove(servicePriceList);
  }
}
