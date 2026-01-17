import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Stable } from '../stable/entities/stable.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createServiceDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createServiceDto.stableId} not found or inactive`,
      );
    }

    const service = this.serviceRepository.create({
      ...createServiceDto,
      isActive: createServiceDto.isActive ?? true,
    });
    return await this.serviceRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: ['stable'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(id);

    // Optimistic locking check
    if (
      updateServiceDto.version !== undefined &&
      service.version !== updateServiceDto.version
    ) {
      throw new ConflictException(
        'The service has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate stable if updating
    if (updateServiceDto.stableId) {
      const stable = await this.stableRepository.findOne({
        where: { id: updateServiceDto.stableId, deletedAt: IsNull() },
      });

      if (!stable) {
        throw new BadRequestException(
          `Stable with ID ${updateServiceDto.stableId} not found or inactive`,
        );
      }
    }

    Object.assign(service, updateServiceDto);
    return await this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.softRemove(service);
  }
}
