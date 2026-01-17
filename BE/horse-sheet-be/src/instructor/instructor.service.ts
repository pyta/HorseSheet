import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Instructor } from './entities/instructor.entity';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { Stable } from '../stable/entities/stable.entity';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
  ) {}

  async create(createInstructorDto: CreateInstructorDto): Promise<Instructor> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createInstructorDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createInstructorDto.stableId} not found or inactive`,
      );
    }

    const instructor = this.instructorRepository.create({
      ...createInstructorDto,
      isActive: createInstructorDto.isActive ?? true,
    });
    return await this.instructorRepository.save(instructor);
  }

  async findAll(): Promise<Instructor[]> {
    return await this.instructorRepository.find({
      where: { deletedAt: IsNull(), isActive: true },
      relations: ['stable'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Instructor> {
    const instructor = await this.instructorRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable'],
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }

    return instructor;
  }

  async update(
    id: string,
    updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    const instructor = await this.findOne(id);

    // Optimistic locking check
    if (
      updateInstructorDto.version !== undefined &&
      instructor.version !== updateInstructorDto.version
    ) {
      throw new ConflictException(
        'The instructor has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate stable if updating
    if (updateInstructorDto.stableId) {
      const stable = await this.stableRepository.findOne({
        where: { id: updateInstructorDto.stableId, deletedAt: IsNull() },
      });

      if (!stable) {
        throw new BadRequestException(
          `Stable with ID ${updateInstructorDto.stableId} not found or inactive`,
        );
      }
    }

    Object.assign(instructor, updateInstructorDto);
    return await this.instructorRepository.save(instructor);
  }

  async remove(id: string): Promise<void> {
    const instructor = await this.findOne(id);
    await this.instructorRepository.softRemove(instructor);
  }
}
