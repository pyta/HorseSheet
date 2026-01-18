import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Participant } from '../participant/entities/participant.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createPaymentDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createPaymentDto.stableId} not found or inactive`,
      );
    }

    // Validate participant exists and is active
    const participant = await this.participantRepository.findOne({
      where: {
        id: createPaymentDto.participantId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!participant) {
      throw new BadRequestException(
        `Participant with ID ${createPaymentDto.participantId} not found or inactive`,
      );
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paymentDate: new Date(createPaymentDto.paymentDate),
    });
    return await this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['stable', 'participant'],
      order: { paymentDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable', 'participant'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    // Optimistic locking check
    if (
      updatePaymentDto.version !== undefined &&
      payment.version !== updatePaymentDto.version
    ) {
      throw new ConflictException(
        'The payment has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate participant if updating
    if (updatePaymentDto.participantId) {
      const participant = await this.participantRepository.findOne({
        where: {
          id: updatePaymentDto.participantId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!participant) {
        throw new BadRequestException(
          `Participant with ID ${updatePaymentDto.participantId} not found or inactive`,
        );
      }
    }

    // Update fields
    if (updatePaymentDto.paymentDate) {
      payment.paymentDate = new Date(updatePaymentDto.paymentDate);
    }
    if (updatePaymentDto.amount !== undefined) {
      payment.amount = updatePaymentDto.amount;
    }
    if (updatePaymentDto.balance !== undefined) {
      payment.balance = updatePaymentDto.balance;
    }
    if (updatePaymentDto.participantId) {
      payment.participantId = updatePaymentDto.participantId;
    }

    return await this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.softRemove(payment);
  }
}
