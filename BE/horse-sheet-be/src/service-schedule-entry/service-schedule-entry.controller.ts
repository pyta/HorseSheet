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
import { ServiceScheduleEntryService } from './service-schedule-entry.service';
import { CreateServiceScheduleEntryDto } from './dto/create-service-schedule-entry.dto';
import { UpdateServiceScheduleEntryDto } from './dto/update-service-schedule-entry.dto';
import { ServiceScheduleEntry } from './entities/service-schedule-entry.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('service-schedule-entries')
@ApiBearerAuth()
@Controller('service-schedule-entries')
@UseGuards(RolesGuard)
@Roles('admin', 'stable_owner', 'stable_manager')
export class ServiceScheduleEntryController {
  constructor(
    private readonly serviceScheduleEntryService: ServiceScheduleEntryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service schedule entry' })
  @ApiResponse({
    status: 201,
    description: 'Service schedule entry created successfully',
    type: ServiceScheduleEntry,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createServiceScheduleEntryDto: CreateServiceScheduleEntryDto,
  ): Promise<ServiceScheduleEntry> {
    return this.serviceScheduleEntryService.create(createServiceScheduleEntryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service schedule entries' })
  @ApiResponse({
    status: 200,
    description: 'List of service schedule entries',
    type: [ServiceScheduleEntry],
  })
  findAll(): Promise<ServiceScheduleEntry[]> {
    return this.serviceScheduleEntryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service schedule entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Service schedule entry details',
    type: ServiceScheduleEntry,
  })
  @ApiResponse({ status: 404, description: 'Service schedule entry not found' })
  findOne(@Param('id') id: string): Promise<ServiceScheduleEntry> {
    return this.serviceScheduleEntryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service schedule entry' })
  @ApiResponse({
    status: 200,
    description: 'Service schedule entry updated successfully',
    type: ServiceScheduleEntry,
  })
  @ApiResponse({ status: 404, description: 'Service schedule entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateServiceScheduleEntryDto: UpdateServiceScheduleEntryDto,
  ): Promise<ServiceScheduleEntry> {
    return this.serviceScheduleEntryService.update(id, updateServiceScheduleEntryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service schedule entry (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Service schedule entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Service schedule entry not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.serviceScheduleEntryService.remove(id);
  }
}
