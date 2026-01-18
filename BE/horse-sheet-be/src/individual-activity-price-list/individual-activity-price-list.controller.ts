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
import { IndividualActivityPriceListService } from './individual-activity-price-list.service';
import { CreateIndividualActivityPriceListDto } from './dto/create-individual-activity-price-list.dto';
import { UpdateIndividualActivityPriceListDto } from './dto/update-individual-activity-price-list.dto';
import { IndividualActivityPriceList } from './entities/individual-activity-price-list.entity';

@ApiTags('individual-activity-price-lists')
@Controller('individual-activity-price-lists')
export class IndividualActivityPriceListController {
  constructor(
    private readonly individualActivityPriceListService: IndividualActivityPriceListService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new individual activity price list entry' })
  @ApiResponse({
    status: 201,
    description: 'Individual activity price list entry created successfully',
    type: IndividualActivityPriceList,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createIndividualActivityPriceListDto: CreateIndividualActivityPriceListDto,
  ): Promise<IndividualActivityPriceList> {
    return this.individualActivityPriceListService.create(createIndividualActivityPriceListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all individual activity price list entries' })
  @ApiResponse({
    status: 200,
    description: 'List of individual activity price list entries',
    type: [IndividualActivityPriceList],
  })
  findAll(): Promise<IndividualActivityPriceList[]> {
    return this.individualActivityPriceListService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an individual activity price list entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Individual activity price list entry details',
    type: IndividualActivityPriceList,
  })
  @ApiResponse({ status: 404, description: 'Individual activity price list entry not found' })
  findOne(@Param('id') id: string): Promise<IndividualActivityPriceList> {
    return this.individualActivityPriceListService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an individual activity price list entry' })
  @ApiResponse({
    status: 200,
    description: 'Individual activity price list entry updated successfully',
    type: IndividualActivityPriceList,
  })
  @ApiResponse({ status: 404, description: 'Individual activity price list entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateIndividualActivityPriceListDto: UpdateIndividualActivityPriceListDto,
  ): Promise<IndividualActivityPriceList> {
    return this.individualActivityPriceListService.update(id, updateIndividualActivityPriceListDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an individual activity price list entry (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Individual activity price list entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Individual activity price list entry not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.individualActivityPriceListService.remove(id);
  }
}
