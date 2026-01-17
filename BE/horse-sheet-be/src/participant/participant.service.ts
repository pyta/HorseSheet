import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Participant } from './entities/participant.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { Stable } from '../stable/entities/stable.entity';
import { ContactPerson } from '../contact-person/entities/contact-person.entity';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(ContactPerson)
    private readonly contactPersonRepository: Repository<ContactPerson>,
  ) {}

  async create(createParticipantDto: CreateParticipantDto): Promise<Participant> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createParticipantDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createParticipantDto.stableId} not found or inactive`,
      );
    }

    // Validate contact person exists and is active
    const contactPerson = await this.contactPersonRepository.findOne({
      where: {
        id: createParticipantDto.defaultContactPersonId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!contactPerson) {
      throw new BadRequestException(
        `Contact person with ID ${createParticipantDto.defaultContactPersonId} not found or inactive`,
      );
    }

    const participant = this.participantRepository.create({
      ...createParticipantDto,
      isActive: createParticipantDto.isActive ?? true,
    });
    return await this.participantRepository.save(participant);
  }

  async findAll(): Promise<Participant[]> {
    return await this.participantRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: ['stable', 'defaultContactPerson'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Participant> {
    const participant = await this.participantRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable', 'defaultContactPerson'],
    });

    if (!participant) {
      throw new NotFoundException(`Participant with ID ${id} not found`);
    }

    return participant;
  }

  async update(
    id: string,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    const participant = await this.findOne(id);

    // Optimistic locking check
    if (
      updateParticipantDto.version !== undefined &&
      participant.version !== updateParticipantDto.version
    ) {
      throw new ConflictException(
        'The participant has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate stable if updating
    if (updateParticipantDto.stableId) {
      const stable = await this.stableRepository.findOne({
        where: { id: updateParticipantDto.stableId, deletedAt: IsNull() },
      });

      if (!stable) {
        throw new BadRequestException(
          `Stable with ID ${updateParticipantDto.stableId} not found or inactive`,
        );
      }
    }

    // Validate contact person if updating
    if (updateParticipantDto.defaultContactPersonId) {
      const contactPerson = await this.contactPersonRepository.findOne({
        where: {
          id: updateParticipantDto.defaultContactPersonId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!contactPerson) {
        throw new BadRequestException(
          `Contact person with ID ${updateParticipantDto.defaultContactPersonId} not found or inactive`,
        );
      }
    }

    Object.assign(participant, updateParticipantDto);
    return await this.participantRepository.save(participant);
  }

  async remove(id: string): Promise<void> {
    const participant = await this.findOne(id);
    await this.participantRepository.softRemove(participant);
  }
}
