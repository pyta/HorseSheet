import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ScheduleEntryService } from './schedule-entry.service';
import { CreateScheduleEntryDto } from './dto/create-schedule-entry.dto';
import { UpdateScheduleEntryDto } from './dto/update-schedule-entry.dto';
import { FilterScheduleEntryDto } from './dto/filter-schedule-entry.dto';
import { DuplicateScheduleEntryDto } from './dto/duplicate-schedule-entry.dto';
import { ScheduleEntry } from './entities/schedule-entry.entity';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('schedule-entries')
@Controller('schedule-entries')
export class ScheduleEntryController {
  constructor(
    private readonly scheduleEntryService: ScheduleEntryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new schedule entry' })
  @ApiResponse({
    status: 201,
    description: 'Schedule entry created successfully',
    type: ScheduleEntry,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createScheduleEntryDto: CreateScheduleEntryDto,
  ): Promise<ScheduleEntry> {
    return this.scheduleEntryService.create(createScheduleEntryDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all schedule entries (public, with filters)' })
  @ApiResponse({
    status: 200,
    description: 'List of schedule entries',
    type: [ScheduleEntry],
  })
  findAll(@Query() filters: FilterScheduleEntryDto): Promise<ScheduleEntry[]> {
    return this.scheduleEntryService.findAll(filters);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export schedule entries to CSV' })
  @ApiResponse({ status: 200, description: 'CSV export' })
  async export(
    @Query() filters: FilterScheduleEntryDto,
    @Res() res: Response,
  ): Promise<void> {
    const csv = await this.scheduleEntryService.export(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="schedule-export-${new Date().toISOString()}.csv"`,
    );
    res.send(csv);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a schedule entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule entry details',
    type: ScheduleEntry,
  })
  @ApiResponse({ status: 404, description: 'Schedule entry not found' })
  findOne(@Param('id') id: string): Promise<ScheduleEntry> {
    return this.scheduleEntryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a schedule entry' })
  @ApiResponse({
    status: 200,
    description: 'Schedule entry updated successfully',
    type: ScheduleEntry,
  })
  @ApiResponse({ status: 404, description: 'Schedule entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateScheduleEntryDto: UpdateScheduleEntryDto,
  ): Promise<ScheduleEntry> {
    return this.scheduleEntryService.update(id, updateScheduleEntryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a schedule entry (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Schedule entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Schedule entry not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.scheduleEntryService.remove(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a schedule entry' })
  @ApiResponse({
    status: 201,
    description: 'Schedule entry duplicated successfully',
    type: ScheduleEntry,
  })
  @ApiResponse({ status: 404, description: 'Schedule entry not found' })
  duplicate(
    @Param('id') id: string,
    @Body() duplicateDto: DuplicateScheduleEntryDto,
  ): Promise<ScheduleEntry> {
    return this.scheduleEntryService.duplicate(id, duplicateDto);
  }
}
