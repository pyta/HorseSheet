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
import { ActivityPriceListService } from './activity-price-list.service';
import { CreateActivityPriceListDto } from './dto/create-activity-price-list.dto';
import { UpdateActivityPriceListDto } from './dto/update-activity-price-list.dto';
import { ActivityPriceList } from './entities/activity-price-list.entity';

@ApiTags('activity-price-lists')
@Controller('activity-price-lists')
export class ActivityPriceListController {
  constructor(private readonly activityPriceListService: ActivityPriceListService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity price list entry' })
  @ApiResponse({
    status: 201,
    description: 'Activity price list entry created successfully',
    type: ActivityPriceList,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createActivityPriceListDto: CreateActivityPriceListDto): Promise<ActivityPriceList> {
    return this.activityPriceListService.create(createActivityPriceListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activity price list entries' })
  @ApiResponse({
    status: 200,
    description: 'List of activity price list entries',
    type: [ActivityPriceList],
  })
  findAll(): Promise<ActivityPriceList[]> {
    return this.activityPriceListService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an activity price list entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity price list entry details',
    type: ActivityPriceList,
  })
  @ApiResponse({ status: 404, description: 'Activity price list entry not found' })
  findOne(@Param('id') id: string): Promise<ActivityPriceList> {
    return this.activityPriceListService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an activity price list entry' })
  @ApiResponse({
    status: 200,
    description: 'Activity price list entry updated successfully',
    type: ActivityPriceList,
  })
  @ApiResponse({ status: 404, description: 'Activity price list entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateActivityPriceListDto: UpdateActivityPriceListDto,
  ): Promise<ActivityPriceList> {
    return this.activityPriceListService.update(id, updateActivityPriceListDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an activity price list entry (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Activity price list entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Activity price list entry not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.activityPriceListService.remove(id);
  }
}
