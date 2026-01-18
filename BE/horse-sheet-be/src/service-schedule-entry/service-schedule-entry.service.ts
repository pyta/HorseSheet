import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { ServiceScheduleEntry } from './entities/service-schedule-entry.entity';
import { ServiceScheduleEntryDetails } from './entities/service-schedule-entry-details.entity';
import { CreateServiceScheduleEntryDto } from './dto/create-service-schedule-entry.dto';
import { UpdateServiceScheduleEntryDto } from './dto/update-service-schedule-entry.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Service } from '../service/entities/service.entity';
import { Participant } from '../participant/entities/participant.entity';

@Injectable()
export class ServiceScheduleEntryService {
  constructor(
    @InjectRepository(ServiceScheduleEntry)
    private readonly serviceScheduleEntryRepository: Repository<ServiceScheduleEntry>,
    @InjectRepository(ServiceScheduleEntryDetails)
    private readonly serviceScheduleEntryDetailsRepository: Repository<ServiceScheduleEntryDetails>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async create(
    createServiceScheduleEntryDto: CreateServiceScheduleEntryDto,
  ): Promise<ServiceScheduleEntry> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createServiceScheduleEntryDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createServiceScheduleEntryDto.stableId} not found or inactive`,
      );
    }

    // Validate service exists and is active
    const service = await this.serviceRepository.findOne({
      where: {
        id: createServiceScheduleEntryDto.serviceId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!service) {
      throw new BadRequestException(
        `Service with ID ${createServiceScheduleEntryDto.serviceId} not found or inactive`,
      );
    }

    // Validate participants exist and are active
    const participants = await this.participantRepository.find({
      where: {
        id: In(createServiceScheduleEntryDto.participantIds),
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (participants.length !== createServiceScheduleEntryDto.participantIds.length) {
      throw new BadRequestException(
        'One or more participants not found or inactive',
      );
    }

    // Create service schedule entry
    const serviceScheduleEntry = this.serviceScheduleEntryRepository.create({
      stableId: createServiceScheduleEntryDto.stableId,
      date: new Date(createServiceScheduleEntryDto.date),
      duration: createServiceScheduleEntryDto.duration,
      serviceId: createServiceScheduleEntryDto.serviceId,
      isActive: createServiceScheduleEntryDto.isActive ?? true,
    });

    const savedEntry = await this.serviceScheduleEntryRepository.save(serviceScheduleEntry);

    // Create participant associations
    const associations = createServiceScheduleEntryDto.participantIds.map(
      (participantId) =>
        this.serviceScheduleEntryDetailsRepository.create({
          serviceScheduleEntryId: savedEntry.id,
          participantId,
        }),
    );
    await this.serviceScheduleEntryDetailsRepository.save(associations);

    return await this.findOne(savedEntry.id);
  }

  async findAll(): Promise<ServiceScheduleEntry[]> {
    return await this.serviceScheduleEntryRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: [
        'stable',
        'service',
        'serviceScheduleEntryDetails',
        'serviceScheduleEntryDetails.participant',
      ],
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ServiceScheduleEntry> {
    const serviceScheduleEntry = await this.serviceScheduleEntryRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: [
        'stable',
        'service',
        'serviceScheduleEntryDetails',
        'serviceScheduleEntryDetails.participant',
      ],
    });

    if (!serviceScheduleEntry) {
      throw new NotFoundException(`Service schedule entry with ID ${id} not found`);
    }

    return serviceScheduleEntry;
  }

  async update(
    id: string,
    updateServiceScheduleEntryDto: UpdateServiceScheduleEntryDto,
  ): Promise<ServiceScheduleEntry> {
    const serviceScheduleEntry = await this.findOne(id);

    // Optimistic locking check
    if (
      updateServiceScheduleEntryDto.version !== undefined &&
      serviceScheduleEntry.version !== updateServiceScheduleEntryDto.version
    ) {
      throw new ConflictException(
        'The service schedule entry has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate service if updating
    if (updateServiceScheduleEntryDto.serviceId) {
      const service = await this.serviceRepository.findOne({
        where: {
          id: updateServiceScheduleEntryDto.serviceId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!service) {
        throw new BadRequestException(
          `Service with ID ${updateServiceScheduleEntryDto.serviceId} not found or inactive`,
        );
      }
    }

    if (updateServiceScheduleEntryDto.participantIds) {
      const participants = await this.participantRepository.find({
        where: {
          id: In(updateServiceScheduleEntryDto.participantIds),
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (participants.length !== updateServiceScheduleEntryDto.participantIds.length) {
        throw new BadRequestException(
          'One or more participants not found or inactive',
        );
      }
    }

    // Update basic fields
    if (updateServiceScheduleEntryDto.date) {
      serviceScheduleEntry.date = new Date(updateServiceScheduleEntryDto.date);
    }
    if (updateServiceScheduleEntryDto.duration) {
      serviceScheduleEntry.duration = updateServiceScheduleEntryDto.duration;
    }
    if (updateServiceScheduleEntryDto.serviceId) {
      serviceScheduleEntry.serviceId = updateServiceScheduleEntryDto.serviceId;
    }
    if (updateServiceScheduleEntryDto.isActive !== undefined) {
      serviceScheduleEntry.isActive = updateServiceScheduleEntryDto.isActive;
    }

    const savedEntry = await this.serviceScheduleEntryRepository.save(serviceScheduleEntry);

    // Update participants if provided
    if (updateServiceScheduleEntryDto.participantIds) {
      // Remove existing associations
      await this.serviceScheduleEntryDetailsRepository.delete({
        serviceScheduleEntryId: savedEntry.id,
      });

      // Create new associations
      const associations = updateServiceScheduleEntryDto.participantIds.map(
        (participantId) =>
          this.serviceScheduleEntryDetailsRepository.create({
            serviceScheduleEntryId: savedEntry.id,
            participantId,
          }),
      );
      await this.serviceScheduleEntryDetailsRepository.save(associations);
    }

    return await this.findOne(savedEntry.id);
  }

  async remove(id: string): Promise<void> {
    const serviceScheduleEntry = await this.findOne(id);
    await this.serviceScheduleEntryRepository.softRemove(serviceScheduleEntry);
  }
}
