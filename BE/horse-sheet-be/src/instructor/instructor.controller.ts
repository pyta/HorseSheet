import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InstructorService } from './instructor.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { Instructor } from './entities/instructor.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('instructors')
@ApiBearerAuth()
@Controller('instructors')
@UseGuards(RolesGuard)
@Roles('admin', 'stable_owner', 'stable_manager')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new instructor' })
  @ApiResponse({ status: 201, description: 'Instructor created successfully', type: Instructor })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createInstructorDto: CreateInstructorDto): Promise<Instructor> {
    return this.instructorService.create(createInstructorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all instructors' })
  @ApiResponse({ status: 200, description: 'List of instructors', type: [Instructor] })
  findAll(): Promise<Instructor[]> {
    return this.instructorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an instructor by ID' })
  @ApiResponse({ status: 200, description: 'Instructor details', type: Instructor })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  findOne(@Param('id') id: string): Promise<Instructor> {
    return this.instructorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an instructor' })
  @ApiResponse({ status: 200, description: 'Instructor updated successfully', type: Instructor })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    return this.instructorService.update(id, updateInstructorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an instructor (soft delete)' })
  @ApiResponse({ status: 204, description: 'Instructor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.instructorService.remove(id);
  }
}
