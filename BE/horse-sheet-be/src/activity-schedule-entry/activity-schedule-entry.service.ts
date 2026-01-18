import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { ActivityScheduleEntry } from './entities/activity-schedule-entry.entity';
import { ActivityScheduleEntryDetails } from './entities/activity-schedule-entry-details.entity';
import { CreateActivityScheduleEntryDto } from './dto/create-activity-schedule-entry.dto';
import { UpdateActivityScheduleEntryDto } from './dto/update-activity-schedule-entry.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Participant } from '../participant/entities/participant.entity';

@Injectable()
export class ActivityScheduleEntryService {
  constructor(
    @InjectRepository(ActivityScheduleEntry)
    private readonly activityScheduleEntryRepository: Repository<ActivityScheduleEntry>,
    @InjectRepository(ActivityScheduleEntryDetails)
    private readonly activityScheduleEntryDetailsRepository: Repository<ActivityScheduleEntryDetails>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async create(
    createActivityScheduleEntryDto: CreateActivityScheduleEntryDto,
  ): Promise<ActivityScheduleEntry> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createActivityScheduleEntryDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createActivityScheduleEntryDto.stableId} not found or inactive`,
      );
    }

    // Validate instructor exists and is active
    const instructor = await this.instructorRepository.findOne({
      where: {
        id: createActivityScheduleEntryDto.instructorId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!instructor) {
      throw new BadRequestException(
        `Instructor with ID ${createActivityScheduleEntryDto.instructorId} not found or inactive`,
      );
    }

    // Validate activity exists and is active
    const activity = await this.activityRepository.findOne({
      where: {
        id: createActivityScheduleEntryDto.activityId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!activity) {
      throw new BadRequestException(
        `Activity with ID ${createActivityScheduleEntryDto.activityId} not found or inactive`,
      );
    }

    // Validate participants exist and are active
    const participants = await this.participantRepository.find({
      where: {
        id: In(createActivityScheduleEntryDto.participantIds),
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (participants.length !== createActivityScheduleEntryDto.participantIds.length) {
      throw new BadRequestException(
        'One or more participants not found or inactive',
      );
    }

    // Create activity schedule entry
    const activityScheduleEntry = this.activityScheduleEntryRepository.create({
      stableId: createActivityScheduleEntryDto.stableId,
      date: new Date(createActivityScheduleEntryDto.date),
      time: createActivityScheduleEntryDto.time,
      duration: createActivityScheduleEntryDto.duration,
      instructorId: createActivityScheduleEntryDto.instructorId,
      activityId: createActivityScheduleEntryDto.activityId,
      isActive: createActivityScheduleEntryDto.isActive ?? true,
    });

    const savedEntry = await this.activityScheduleEntryRepository.save(activityScheduleEntry);

    // Create participant associations
    const associations = createActivityScheduleEntryDto.participantIds.map(
      (participantId) =>
        this.activityScheduleEntryDetailsRepository.create({
          activityScheduleEntryId: savedEntry.id,
          participantId,
        }),
    );
    await this.activityScheduleEntryDetailsRepository.save(associations);

    return await this.findOne(savedEntry.id);
  }

  async findAll(): Promise<ActivityScheduleEntry[]> {
    return await this.activityScheduleEntryRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: [
        'stable',
        'instructor',
        'activity',
        'activityScheduleEntryDetails',
        'activityScheduleEntryDetails.participant',
      ],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ActivityScheduleEntry> {
    const activityScheduleEntry = await this.activityScheduleEntryRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: [
        'stable',
        'instructor',
        'activity',
        'activityScheduleEntryDetails',
        'activityScheduleEntryDetails.participant',
      ],
    });

    if (!activityScheduleEntry) {
      throw new NotFoundException(`Activity schedule entry with ID ${id} not found`);
    }

    return activityScheduleEntry;
  }

  async update(
    id: string,
    updateActivityScheduleEntryDto: UpdateActivityScheduleEntryDto,
  ): Promise<ActivityScheduleEntry> {
    const activityScheduleEntry = await this.findOne(id);

    // Optimistic locking check
    if (
      updateActivityScheduleEntryDto.version !== undefined &&
      activityScheduleEntry.version !== updateActivityScheduleEntryDto.version
    ) {
      throw new ConflictException(
        'The activity schedule entry has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate entities if updating
    if (updateActivityScheduleEntryDto.instructorId) {
      const instructor = await this.instructorRepository.findOne({
        where: {
          id: updateActivityScheduleEntryDto.instructorId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!instructor) {
        throw new BadRequestException(
          `Instructor with ID ${updateActivityScheduleEntryDto.instructorId} not found or inactive`,
        );
      }
    }

    if (updateActivityScheduleEntryDto.activityId) {
      const activity = await this.activityRepository.findOne({
        where: {
          id: updateActivityScheduleEntryDto.activityId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!activity) {
        throw new BadRequestException(
          `Activity with ID ${updateActivityScheduleEntryDto.activityId} not found or inactive`,
        );
      }
    }

    if (updateActivityScheduleEntryDto.participantIds) {
      const participants = await this.participantRepository.find({
        where: {
          id: In(updateActivityScheduleEntryDto.participantIds),
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (participants.length !== updateActivityScheduleEntryDto.participantIds.length) {
        throw new BadRequestException(
          'One or more participants not found or inactive',
        );
      }
    }

    // Update basic fields
    if (updateActivityScheduleEntryDto.date) {
      activityScheduleEntry.date = new Date(updateActivityScheduleEntryDto.date);
    }
    if (updateActivityScheduleEntryDto.time) {
      activityScheduleEntry.time = updateActivityScheduleEntryDto.time;
    }
    if (updateActivityScheduleEntryDto.duration !== undefined) {
      activityScheduleEntry.duration = updateActivityScheduleEntryDto.duration;
    }
    if (updateActivityScheduleEntryDto.instructorId) {
      activityScheduleEntry.instructorId = updateActivityScheduleEntryDto.instructorId;
    }
    if (updateActivityScheduleEntryDto.activityId) {
      activityScheduleEntry.activityId = updateActivityScheduleEntryDto.activityId;
    }
    if (updateActivityScheduleEntryDto.isActive !== undefined) {
      activityScheduleEntry.isActive = updateActivityScheduleEntryDto.isActive;
    }

    const savedEntry = await this.activityScheduleEntryRepository.save(activityScheduleEntry);

    // Update participants if provided
    if (updateActivityScheduleEntryDto.participantIds) {
      // Remove existing associations
      await this.activityScheduleEntryDetailsRepository.delete({
        activityScheduleEntryId: savedEntry.id,
      });

      // Create new associations
      const associations = updateActivityScheduleEntryDto.participantIds.map(
        (participantId) =>
          this.activityScheduleEntryDetailsRepository.create({
            activityScheduleEntryId: savedEntry.id,
            participantId,
          }),
      );
      await this.activityScheduleEntryDetailsRepository.save(associations);
    }

    return await this.findOne(savedEntry.id);
  }

  async remove(id: string): Promise<void> {
    const activityScheduleEntry = await this.findOne(id);
    await this.activityScheduleEntryRepository.softRemove(activityScheduleEntry);
  }
}
