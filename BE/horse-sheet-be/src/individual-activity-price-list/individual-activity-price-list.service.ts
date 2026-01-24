import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { IndividualActivityPriceList } from './entities/individual-activity-price-list.entity';
import { CreateIndividualActivityPriceListDto } from './dto/create-individual-activity-price-list.dto';
import { UpdateIndividualActivityPriceListDto } from './dto/update-individual-activity-price-list.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Participant } from '../participant/entities/participant.entity';
import { IndividualActivityPriceListHistory } from '../individual-activity-price-list-history/entities/individual-activity-price-list-history.entity';

@Injectable()
export class IndividualActivityPriceListService {
  constructor(
    @InjectRepository(IndividualActivityPriceList)
    private readonly individualActivityPriceListRepository: Repository<IndividualActivityPriceList>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(IndividualActivityPriceListHistory)
    private readonly individualActivityPriceListHistoryRepository: Repository<IndividualActivityPriceListHistory>,
  ) {}

  async create(
    createIndividualActivityPriceListDto: CreateIndividualActivityPriceListDto,
  ): Promise<IndividualActivityPriceList> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createIndividualActivityPriceListDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createIndividualActivityPriceListDto.stableId} not found or inactive`,
      );
    }

    // Validate activity if provided
    if (createIndividualActivityPriceListDto.activityId) {
      const activity = await this.activityRepository.findOne({
        where: {
          id: createIndividualActivityPriceListDto.activityId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!activity) {
        throw new BadRequestException(
          `Activity with ID ${createIndividualActivityPriceListDto.activityId} not found or inactive`,
        );
      }
    }

    // Validate instructor exists and is active
    const instructor = await this.instructorRepository.findOne({
      where: {
        id: createIndividualActivityPriceListDto.instructorId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!instructor) {
      throw new BadRequestException(
        `Instructor with ID ${createIndividualActivityPriceListDto.instructorId} not found or inactive`,
      );
    }

    // Validate participant exists and is active
    const participant = await this.participantRepository.findOne({
      where: {
        id: createIndividualActivityPriceListDto.participantId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!participant) {
      throw new BadRequestException(
        `Participant with ID ${createIndividualActivityPriceListDto.participantId} not found or inactive`,
      );
    }

    const individualActivityPriceList = this.individualActivityPriceListRepository.create({
      ...createIndividualActivityPriceListDto,
      currency: createIndividualActivityPriceListDto.currency || 'PLN',
    });
    const savedPriceList = await this.individualActivityPriceListRepository.save(individualActivityPriceList);

    // Create history entry
    const historyEntry = this.individualActivityPriceListHistoryRepository.create({
      stableId: savedPriceList.stableId,
      activityId: savedPriceList.activityId,
      price: savedPriceList.price,
      currency: savedPriceList.currency,
      instructorId: savedPriceList.instructorId,
      participantId: savedPriceList.participantId,
      dateFrom: new Date(),
      dateTo: null,
    });
    await this.individualActivityPriceListHistoryRepository.save(historyEntry);

    return savedPriceList;
  }

  async findAll(): Promise<IndividualActivityPriceList[]> {
    return await this.individualActivityPriceListRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['stable', 'activity', 'instructor', 'participant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<IndividualActivityPriceList> {
    const individualActivityPriceList = await this.individualActivityPriceListRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable', 'activity', 'instructor', 'participant'],
    });

    if (!individualActivityPriceList) {
      throw new NotFoundException(`Individual activity price list entry with ID ${id} not found`);
    }

    return individualActivityPriceList;
  }

  async update(
    id: string,
    updateIndividualActivityPriceListDto: UpdateIndividualActivityPriceListDto,
  ): Promise<IndividualActivityPriceList> {
    const individualActivityPriceList = await this.findOne(id);

    // Optimistic locking check
    if (
      updateIndividualActivityPriceListDto.version !== undefined &&
      individualActivityPriceList.version !== updateIndividualActivityPriceListDto.version
    ) {
      throw new ConflictException(
        'The individual activity price list entry has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate activity if updating
    if (updateIndividualActivityPriceListDto.activityId !== undefined) {
      if (updateIndividualActivityPriceListDto.activityId) {
        const activity = await this.activityRepository.findOne({
          where: {
            id: updateIndividualActivityPriceListDto.activityId,
            deletedAt: IsNull(),
            isActive: true,
          },
        });

        if (!activity) {
          throw new BadRequestException(
            `Activity with ID ${updateIndividualActivityPriceListDto.activityId} not found or inactive`,
          );
        }
      }
    }

    // Validate instructor if updating
    if (updateIndividualActivityPriceListDto.instructorId) {
      const instructor = await this.instructorRepository.findOne({
        where: {
          id: updateIndividualActivityPriceListDto.instructorId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!instructor) {
        throw new BadRequestException(
          `Instructor with ID ${updateIndividualActivityPriceListDto.instructorId} not found or inactive`,
        );
      }
    }

    // Validate participant if updating
    if (updateIndividualActivityPriceListDto.participantId) {
      const participant = await this.participantRepository.findOne({
        where: {
          id: updateIndividualActivityPriceListDto.participantId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!participant) {
        throw new BadRequestException(
          `Participant with ID ${updateIndividualActivityPriceListDto.participantId} not found or inactive`,
        );
      }
    }

    // Check if price changed (field that affects pricing)
    const priceChanged =
      updateIndividualActivityPriceListDto.price !== undefined &&
      updateIndividualActivityPriceListDto.price !== individualActivityPriceList.price;

    if (priceChanged) {
      // Close existing history entry
      const whereCondition: any = {
        stableId: individualActivityPriceList.stableId,
        instructorId: individualActivityPriceList.instructorId,
        participantId: individualActivityPriceList.participantId,
        dateTo: IsNull(),
        deletedAt: IsNull(),
      };

      // Handle nullable activityId
      if (individualActivityPriceList.activityId === null) {
        whereCondition.activityId = IsNull();
      } else {
        whereCondition.activityId = individualActivityPriceList.activityId;
      }

      const existingHistory = await this.individualActivityPriceListHistoryRepository.findOne({
        where: whereCondition,
        order: { dateFrom: 'DESC' },
      });

      if (existingHistory) {
        existingHistory.dateTo = new Date();
        await this.individualActivityPriceListHistoryRepository.save(existingHistory);
      }

      // Create new history entry
      const historyEntry = this.individualActivityPriceListHistoryRepository.create({
        stableId: individualActivityPriceList.stableId,
        activityId: updateIndividualActivityPriceListDto.activityId !== undefined ? updateIndividualActivityPriceListDto.activityId : individualActivityPriceList.activityId,
        price: updateIndividualActivityPriceListDto.price !== undefined ? updateIndividualActivityPriceListDto.price : individualActivityPriceList.price,
        currency: updateIndividualActivityPriceListDto.currency || individualActivityPriceList.currency,
        instructorId: updateIndividualActivityPriceListDto.instructorId || individualActivityPriceList.instructorId,
        participantId: updateIndividualActivityPriceListDto.participantId || individualActivityPriceList.participantId,
        dateFrom: new Date(),
        dateTo: null,
      });
      await this.individualActivityPriceListHistoryRepository.save(historyEntry);
    }

    Object.assign(individualActivityPriceList, updateIndividualActivityPriceListDto);
    return await this.individualActivityPriceListRepository.save(individualActivityPriceList);
  }

  async remove(id: string): Promise<void> {
    const individualActivityPriceList = await this.findOne(id);
    await this.individualActivityPriceListRepository.softRemove(individualActivityPriceList);
  }
}
