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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActivityScheduleEntryService } from './activity-schedule-entry.service';
import { CreateActivityScheduleEntryDto } from './dto/create-activity-schedule-entry.dto';
import { UpdateActivityScheduleEntryDto } from './dto/update-activity-schedule-entry.dto';
import { ActivityScheduleEntry } from './entities/activity-schedule-entry.entity';

@ApiTags('activity-schedule-entries')
@Controller('activity-schedule-entries')
export class ActivityScheduleEntryController {
  constructor(
    private readonly activityScheduleEntryService: ActivityScheduleEntryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity schedule entry' })
  @ApiResponse({
    status: 201,
    description: 'Activity schedule entry created successfully',
    type: ActivityScheduleEntry,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createActivityScheduleEntryDto: CreateActivityScheduleEntryDto,
  ): Promise<ActivityScheduleEntry> {
    return this.activityScheduleEntryService.create(createActivityScheduleEntryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activity schedule entries' })
  @ApiResponse({
    status: 200,
    description: 'List of activity schedule entries',
    type: [ActivityScheduleEntry],
  })
  findAll(): Promise<ActivityScheduleEntry[]> {
    return this.activityScheduleEntryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an activity schedule entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity schedule entry details',
    type: ActivityScheduleEntry,
  })
  @ApiResponse({ status: 404, description: 'Activity schedule entry not found' })
  findOne(@Param('id') id: string): Promise<ActivityScheduleEntry> {
    return this.activityScheduleEntryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an activity schedule entry' })
  @ApiResponse({
    status: 200,
    description: 'Activity schedule entry updated successfully',
    type: ActivityScheduleEntry,
  })
  @ApiResponse({ status: 404, description: 'Activity schedule entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateActivityScheduleEntryDto: UpdateActivityScheduleEntryDto,
  ): Promise<ActivityScheduleEntry> {
    return this.activityScheduleEntryService.update(id, updateActivityScheduleEntryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an activity schedule entry (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Activity schedule entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Activity schedule entry not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.activityScheduleEntryService.remove(id);
  }
}
