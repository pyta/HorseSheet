import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { ScheduleEntry } from './entities/schedule-entry.entity';
import { ScheduleEntryParticipant } from './entities/schedule-entry-participant.entity';
import { CreateScheduleEntryDto } from './dto/create-schedule-entry.dto';
import { UpdateScheduleEntryDto } from './dto/update-schedule-entry.dto';
import { FilterScheduleEntryDto } from './dto/filter-schedule-entry.dto';
import { DuplicateScheduleEntryDto } from './dto/duplicate-schedule-entry.dto';
import { Stable } from '../stable/entities/stable.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Participant } from '../participant/entities/participant.entity';
import { Service } from '../service/entities/service.entity';

@Injectable()
export class ScheduleEntryService {
  constructor(
    @InjectRepository(ScheduleEntry)
    private readonly scheduleEntryRepository: Repository<ScheduleEntry>,
    @InjectRepository(ScheduleEntryParticipant)
    private readonly scheduleEntryParticipantRepository: Repository<ScheduleEntryParticipant>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(
    createScheduleEntryDto: CreateScheduleEntryDto,
  ): Promise<ScheduleEntry> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createScheduleEntryDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createScheduleEntryDto.stableId} not found or inactive`,
      );
    }

    // Validate instructor exists and is active
    const instructor = await this.instructorRepository.findOne({
      where: {
        id: createScheduleEntryDto.instructorId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!instructor) {
      throw new BadRequestException(
        `Instructor with ID ${createScheduleEntryDto.instructorId} not found or inactive`,
      );
    }

    // Validate activity exists and is active
    const activity = await this.activityRepository.findOne({
      where: {
        id: createScheduleEntryDto.activityId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!activity) {
      throw new BadRequestException(
        `Activity with ID ${createScheduleEntryDto.activityId} not found or inactive`,
      );
    }

    // Validate participants exist and are active
    const participants = await this.participantRepository.find({
      where: {
        id: In(createScheduleEntryDto.participantIds),
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (participants.length !== createScheduleEntryDto.participantIds.length) {
      throw new BadRequestException(
        'One or more participants not found or inactive',
      );
    }

    // Validate services if provided
    if (createScheduleEntryDto.participantServices) {
      const serviceIds = createScheduleEntryDto.participantServices
        .map((ps) => ps.serviceId)
        .filter((id) => id !== undefined && id !== null);

      if (serviceIds.length > 0) {
        const services = await this.serviceRepository.find({
          where: {
            id: In(serviceIds),
            deletedAt: IsNull(),
            isActive: true,
          },
        });

        if (services.length !== serviceIds.length) {
          throw new BadRequestException(
            'One or more services not found or inactive',
          );
        }
      }
    }

    // Create schedule entry
    const scheduleEntry = this.scheduleEntryRepository.create({
      stableId: createScheduleEntryDto.stableId,
      date: new Date(createScheduleEntryDto.date),
      time: createScheduleEntryDto.time,
      instructorId: createScheduleEntryDto.instructorId,
      activityId: createScheduleEntryDto.activityId,
      isActive: true,
    });

    const savedEntry = await this.scheduleEntryRepository.save(scheduleEntry);

    // Create participant associations (with optional services)
    const participantServicesMap = new Map(
      (createScheduleEntryDto.participantServices || []).map((ps) => [
        ps.participantId,
        ps.serviceId,
      ]),
    );

    const associations = createScheduleEntryDto.participantIds.map(
      (participantId) =>
        this.scheduleEntryParticipantRepository.create({
          scheduleEntryId: savedEntry.id,
          participantId,
          serviceId: participantServicesMap.get(participantId) || null,
        }),
    );
    await this.scheduleEntryParticipantRepository.save(associations);

    return await this.findOne(savedEntry.id);
  }

  async findAll(filters?: FilterScheduleEntryDto): Promise<ScheduleEntry[]> {
    const queryBuilder = this.scheduleEntryRepository
      .createQueryBuilder('scheduleEntry')
      .leftJoinAndSelect('scheduleEntry.stable', 'stable')
      .leftJoinAndSelect('scheduleEntry.instructor', 'instructor')
      .leftJoinAndSelect('scheduleEntry.activity', 'activity')
      .leftJoinAndSelect(
        'scheduleEntry.scheduleEntryParticipants',
        'scheduleEntryParticipants',
      )
      .leftJoinAndSelect('scheduleEntryParticipants.participant', 'participant')
      .leftJoinAndSelect('scheduleEntryParticipants.service', 'service')
      .where('scheduleEntry.deletedAt IS NULL')
      .andWhere('scheduleEntry.isActive = :isActive', { isActive: true });

    if (filters) {
      if (filters.startDate && filters.endDate) {
        queryBuilder.andWhere('scheduleEntry.date BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      } else if (filters.startDate) {
        queryBuilder.andWhere('scheduleEntry.date >= :startDate', {
          startDate: filters.startDate,
        });
      } else if (filters.endDate) {
        queryBuilder.andWhere('scheduleEntry.date <= :endDate', {
          endDate: filters.endDate,
        });
      }

      if (filters.instructorId) {
        queryBuilder.andWhere('scheduleEntry.instructorId = :instructorId', {
          instructorId: filters.instructorId,
        });
      }

      if (filters.participantId) {
        queryBuilder.andWhere('participant.id = :participantId', {
          participantId: filters.participantId,
        });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(instructor.name ILIKE :search OR activity.name ILIKE :search OR participant.name ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }
    }

    return await queryBuilder
      .orderBy('scheduleEntry.date', 'ASC')
      .addOrderBy('scheduleEntry.time', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<ScheduleEntry> {
    const scheduleEntry = await this.scheduleEntryRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: [
        'stable',
        'instructor',
        'activity',
        'scheduleEntryParticipants',
        'scheduleEntryParticipants.participant',
        'scheduleEntryParticipants.service',
      ],
    });

    if (!scheduleEntry) {
      throw new NotFoundException(`Schedule entry with ID ${id} not found`);
    }

    return scheduleEntry;
  }

  async update(
    id: string,
    updateScheduleEntryDto: UpdateScheduleEntryDto,
  ): Promise<ScheduleEntry> {
    const scheduleEntry = await this.findOne(id);

    // Optimistic locking check
    if (
      updateScheduleEntryDto.version !== undefined &&
      scheduleEntry.version !== updateScheduleEntryDto.version
    ) {
      throw new ConflictException(
        'The schedule entry has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate entities if updating
    if (updateScheduleEntryDto.instructorId) {
      const instructor = await this.instructorRepository.findOne({
        where: {
          id: updateScheduleEntryDto.instructorId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!instructor) {
        throw new BadRequestException(
          `Instructor with ID ${updateScheduleEntryDto.instructorId} not found or inactive`,
        );
      }
    }

    if (updateScheduleEntryDto.activityId) {
      const activity = await this.activityRepository.findOne({
        where: {
          id: updateScheduleEntryDto.activityId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!activity) {
        throw new BadRequestException(
          `Activity with ID ${updateScheduleEntryDto.activityId} not found or inactive`,
        );
      }
    }

    if (updateScheduleEntryDto.participantIds) {
      const participants = await this.participantRepository.find({
        where: {
          id: In(updateScheduleEntryDto.participantIds),
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (participants.length !== updateScheduleEntryDto.participantIds.length) {
        throw new BadRequestException(
          'One or more participants not found or inactive',
        );
      }
    }

    // Update basic fields
    if (updateScheduleEntryDto.date) {
      scheduleEntry.date = new Date(updateScheduleEntryDto.date);
    }
    if (updateScheduleEntryDto.time) {
      scheduleEntry.time = updateScheduleEntryDto.time;
    }
    if (updateScheduleEntryDto.instructorId) {
      scheduleEntry.instructorId = updateScheduleEntryDto.instructorId;
    }
    if (updateScheduleEntryDto.activityId) {
      scheduleEntry.activityId = updateScheduleEntryDto.activityId;
    }

    const savedEntry = await this.scheduleEntryRepository.save(scheduleEntry);

    // Update participants if provided
    if (updateScheduleEntryDto.participantIds) {
      // Remove existing associations
      await this.scheduleEntryParticipantRepository.delete({
        scheduleEntryId: savedEntry.id,
      });

      // Create new associations
      const participantServicesMap = new Map(
        (updateScheduleEntryDto.participantServices || []).map((ps) => [
          ps.participantId,
          ps.serviceId,
        ]),
      );

      const associations = updateScheduleEntryDto.participantIds.map(
        (participantId) =>
          this.scheduleEntryParticipantRepository.create({
            scheduleEntryId: savedEntry.id,
            participantId,
            serviceId: participantServicesMap.get(participantId) || null,
          }),
      );
      await this.scheduleEntryParticipantRepository.save(associations);
    } else if (updateScheduleEntryDto.participantServices) {
      // Update only services for existing participants
      for (const ps of updateScheduleEntryDto.participantServices) {
        await this.scheduleEntryParticipantRepository.update(
          {
            scheduleEntryId: savedEntry.id,
            participantId: ps.participantId,
          },
          { serviceId: ps.serviceId || null },
        );
      }
    }

    return await this.findOne(savedEntry.id);
  }

  async remove(id: string): Promise<void> {
    const scheduleEntry = await this.findOne(id);
    await this.scheduleEntryRepository.softRemove(scheduleEntry);
  }

  async duplicate(
    id: string,
    duplicateDto: DuplicateScheduleEntryDto,
  ): Promise<ScheduleEntry> {
    const original = await this.findOne(id);

    const createDto: CreateScheduleEntryDto = {
      stableId: original.stableId,
      date: duplicateDto.date || original.date.toISOString().split('T')[0],
      time: duplicateDto.time || original.time,
      instructorId: original.instructorId,
      activityId: original.activityId,
      participantIds: original.scheduleEntryParticipants.map(
        (sep) => sep.participantId,
      ),
      participantServices: original.scheduleEntryParticipants.map((sep) => ({
        participantId: sep.participantId,
        serviceId: sep.serviceId || undefined,
      })),
    };

    return await this.create(createDto);
  }

  async export(filters?: FilterScheduleEntryDto): Promise<string> {
    const entries = await this.findAll(filters);

    // CSV header
    const headers = [
      'Date',
      'Time',
      'Instructor',
      'Activity',
      'Participants',
      'Services',
      'Price',
    ];

    // CSV rows
    const rows = entries.map((entry) => {
      const participants = entry.scheduleEntryParticipants
        .map((sep) => sep.participant.name)
        .join('; ');
      const services = entry.scheduleEntryParticipants
        .filter((sep) => sep.service !== null)
        .map((sep) => sep.service!.name)
        .join('; ');

      // Get price from price list (simplified - would need to join with price list)
      const price = 'N/A'; // TODO: Join with price list to get actual price

      return [
        entry.date.toISOString().split('T')[0],
        entry.time,
        entry.instructor.name,
        entry.activity.name,
        participants,
        services || 'N/A',
        price,
      ];
    });

    // Combine headers and rows
    const csvLines = [headers.join(',')];
    csvLines.push(...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')));

    return csvLines.join('\n');
  }
}
