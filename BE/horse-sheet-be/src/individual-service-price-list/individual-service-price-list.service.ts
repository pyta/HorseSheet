import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { IndividualServicePriceList } from './entities/individual-service-price-list.entity';
import { CreateIndividualServicePriceListDto } from './dto/create-individual-service-price-list.dto';
import { UpdateIndividualServicePriceListDto } from './dto/update-individual-service-price-list.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Service } from '../service/entities/service.entity';
import { Participant } from '../participant/entities/participant.entity';

@Injectable()
export class IndividualServicePriceListService {
  constructor(
    @InjectRepository(IndividualServicePriceList)
    private readonly individualServicePriceListRepository: Repository<IndividualServicePriceList>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async create(
    createIndividualServicePriceListDto: CreateIndividualServicePriceListDto,
  ): Promise<IndividualServicePriceList> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createIndividualServicePriceListDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createIndividualServicePriceListDto.stableId} not found or inactive`,
      );
    }

    // Validate service if provided
    if (createIndividualServicePriceListDto.serviceId) {
      const service = await this.serviceRepository.findOne({
        where: {
          id: createIndividualServicePriceListDto.serviceId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!service) {
        throw new BadRequestException(
          `Service with ID ${createIndividualServicePriceListDto.serviceId} not found or inactive`,
        );
      }
    }

    // Validate participant exists and is active
    const participant = await this.participantRepository.findOne({
      where: {
        id: createIndividualServicePriceListDto.participantId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!participant) {
      throw new BadRequestException(
        `Participant with ID ${createIndividualServicePriceListDto.participantId} not found or inactive`,
      );
    }

    const individualServicePriceList = this.individualServicePriceListRepository.create({
      ...createIndividualServicePriceListDto,
      currency: createIndividualServicePriceListDto.currency || 'PLN',
    });
    return await this.individualServicePriceListRepository.save(individualServicePriceList);
  }

  async findAll(): Promise<IndividualServicePriceList[]> {
    return await this.individualServicePriceListRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['stable', 'service', 'participant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<IndividualServicePriceList> {
    const individualServicePriceList = await this.individualServicePriceListRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable', 'service', 'participant'],
    });

    if (!individualServicePriceList) {
      throw new NotFoundException(`Individual service price list entry with ID ${id} not found`);
    }

    return individualServicePriceList;
  }

  async update(
    id: string,
    updateIndividualServicePriceListDto: UpdateIndividualServicePriceListDto,
  ): Promise<IndividualServicePriceList> {
    const individualServicePriceList = await this.findOne(id);

    // Optimistic locking check
    if (
      updateIndividualServicePriceListDto.version !== undefined &&
      individualServicePriceList.version !== updateIndividualServicePriceListDto.version
    ) {
      throw new ConflictException(
        'The individual service price list entry has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate service if updating
    if (updateIndividualServicePriceListDto.serviceId !== undefined) {
      if (updateIndividualServicePriceListDto.serviceId) {
        const service = await this.serviceRepository.findOne({
          where: {
            id: updateIndividualServicePriceListDto.serviceId,
            deletedAt: IsNull(),
            isActive: true,
          },
        });

        if (!service) {
          throw new BadRequestException(
            `Service with ID ${updateIndividualServicePriceListDto.serviceId} not found or inactive`,
          );
        }
      }
    }

    // Validate participant if updating
    if (updateIndividualServicePriceListDto.participantId) {
      const participant = await this.participantRepository.findOne({
        where: {
          id: updateIndividualServicePriceListDto.participantId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!participant) {
        throw new BadRequestException(
          `Participant with ID ${updateIndividualServicePriceListDto.participantId} not found or inactive`,
        );
      }
    }

    Object.assign(individualServicePriceList, updateIndividualServicePriceListDto);
    return await this.individualServicePriceListRepository.save(individualServicePriceList);
  }

  async remove(id: string): Promise<void> {
    const individualServicePriceList = await this.findOne(id);
    await this.individualServicePriceListRepository.softRemove(individualServicePriceList);
  }
}
