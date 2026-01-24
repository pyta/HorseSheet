import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Balance } from './entities/balance.entity';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { ContactPerson } from '../contact-person/entities/contact-person.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    @InjectRepository(ContactPerson)
    private readonly contactPersonRepository: Repository<ContactPerson>,
  ) {}

  async create(createBalanceDto: CreateBalanceDto): Promise<Balance> {
    // Validate contact person exists and is active
    const contactPerson = await this.contactPersonRepository.findOne({
      where: {
        id: createBalanceDto.contactPersonId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!contactPerson) {
      throw new BadRequestException(
        `Contact person with ID ${createBalanceDto.contactPersonId} not found or inactive`,
      );
    }

    const balance = this.balanceRepository.create(createBalanceDto);
    return await this.balanceRepository.save(balance);
  }

  async findAll(): Promise<Balance[]> {
    return await this.balanceRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['contactPerson'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Balance> {
    const balance = await this.balanceRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['contactPerson'],
    });

    if (!balance) {
      throw new NotFoundException(`Balance with ID ${id} not found`);
    }

    return balance;
  }

  async findByContactPersonId(contactPersonId: string): Promise<Balance | null> {
    return await this.balanceRepository.findOne({
      where: { contactPersonId, deletedAt: IsNull() },
      relations: ['contactPerson'],
    });
  }

  async update(id: string, updateBalanceDto: UpdateBalanceDto): Promise<Balance> {
    const balance = await this.findOne(id);

    // Optimistic locking check
    if (
      updateBalanceDto.version !== undefined &&
      balance.version !== updateBalanceDto.version
    ) {
      throw new ConflictException(
        'The balance has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate contact person if updating
    if (updateBalanceDto.contactPersonId) {
      const contactPerson = await this.contactPersonRepository.findOne({
        where: {
          id: updateBalanceDto.contactPersonId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!contactPerson) {
        throw new BadRequestException(
          `Contact person with ID ${updateBalanceDto.contactPersonId} not found or inactive`,
        );
      }
    }

    Object.assign(balance, updateBalanceDto);
    return await this.balanceRepository.save(balance);
  }

  async remove(id: string): Promise<void> {
    const balance = await this.findOne(id);
    await this.balanceRepository.softRemove(balance);
  }

  async updateBalanceByContactPersonId(
    contactPersonId: string,
    value: number,
  ): Promise<Balance> {
    let balance = await this.findByContactPersonId(contactPersonId);

    if (!balance) {
      // Create new balance if it doesn't exist
      balance = await this.create({
        contactPersonId,
        balance: value,
      });
    } else {
      // Update existing balance
      balance.balance = Number(balance.balance) + value;
      balance = await this.balanceRepository.save(balance);
    }

    return balance;
  }
}

