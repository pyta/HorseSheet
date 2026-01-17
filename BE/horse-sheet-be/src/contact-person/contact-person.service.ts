import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ContactPerson } from './entities/contact-person.entity';
import { CreateContactPersonDto } from './dto/create-contact-person.dto';
import { UpdateContactPersonDto } from './dto/update-contact-person.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Participant } from '../participant/entities/participant.entity';

@Injectable()
export class ContactPersonService {
  constructor(
    @InjectRepository(ContactPerson)
    private readonly contactPersonRepository: Repository<ContactPerson>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async create(
    createContactPersonDto: CreateContactPersonDto,
  ): Promise<ContactPerson> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createContactPersonDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createContactPersonDto.stableId} not found or inactive`,
      );
    }

    const contactPerson = this.contactPersonRepository.create({
      ...createContactPersonDto,
      isActive: createContactPersonDto.isActive ?? true,
    });
    return await this.contactPersonRepository.save(contactPerson);
  }

  async findAll(): Promise<ContactPerson[]> {
    return await this.contactPersonRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: ['stable'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ContactPerson> {
    const contactPerson = await this.contactPersonRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable'],
    });

    if (!contactPerson) {
      throw new NotFoundException(`Contact person with ID ${id} not found`);
    }

    return contactPerson;
  }

  async update(
    id: string,
    updateContactPersonDto: UpdateContactPersonDto,
  ): Promise<ContactPerson> {
    const contactPerson = await this.findOne(id);

    // Optimistic locking check
    if (
      updateContactPersonDto.version !== undefined &&
      contactPerson.version !== updateContactPersonDto.version
    ) {
      throw new ConflictException(
        'The contact person has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate stable if updating
    if (updateContactPersonDto.stableId) {
      const stable = await this.stableRepository.findOne({
        where: { id: updateContactPersonDto.stableId, deletedAt: IsNull() },
      });

      if (!stable) {
        throw new BadRequestException(
          `Stable with ID ${updateContactPersonDto.stableId} not found or inactive`,
        );
      }
    }

    Object.assign(contactPerson, updateContactPersonDto);
    return await this.contactPersonRepository.save(contactPerson);
  }

  async remove(id: string): Promise<void> {
    const contactPerson = await this.findOne(id);

    // Check if contact person is used as default for any participant
    const participants = await this.participantRepository.find({
      where: { defaultContactPersonId: id, deletedAt: IsNull() },
    });

    if (participants.length > 0) {
      throw new BadRequestException(
        'Cannot delete contact person that is assigned as default to one or more participants. Please reassign participants first.',
      );
    }

    await this.contactPersonRepository.softRemove(contactPerson);
  }
}
