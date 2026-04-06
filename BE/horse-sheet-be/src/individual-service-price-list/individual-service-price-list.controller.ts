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
import { IndividualServicePriceListService } from './individual-service-price-list.service';
import { CreateIndividualServicePriceListDto } from './dto/create-individual-service-price-list.dto';
import { UpdateIndividualServicePriceListDto } from './dto/update-individual-service-price-list.dto';
import { IndividualServicePriceList } from './entities/individual-service-price-list.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('individual-service-price-lists')
@ApiBearerAuth()
@Controller('individual-service-price-lists')
@UseGuards(RolesGuard)
@Roles('admin', 'stable_owner')
export class IndividualServicePriceListController {
  constructor(
    private readonly individualServicePriceListService: IndividualServicePriceListService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new individual service price list entry' })
  @ApiResponse({
    status: 201,
    description: 'Individual service price list entry created successfully',
    type: IndividualServicePriceList,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createIndividualServicePriceListDto: CreateIndividualServicePriceListDto,
  ): Promise<IndividualServicePriceList> {
    return this.individualServicePriceListService.create(createIndividualServicePriceListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all individual service price list entries' })
  @ApiResponse({
    status: 200,
    description: 'List of individual service price list entries',
    type: [IndividualServicePriceList],
  })
  findAll(): Promise<IndividualServicePriceList[]> {
    return this.individualServicePriceListService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an individual service price list entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Individual service price list entry details',
    type: IndividualServicePriceList,
  })
  @ApiResponse({ status: 404, description: 'Individual service price list entry not found' })
  findOne(@Param('id') id: string): Promise<IndividualServicePriceList> {
    return this.individualServicePriceListService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an individual service price list entry' })
  @ApiResponse({
    status: 200,
    description: 'Individual service price list entry updated successfully',
    type: IndividualServicePriceList,
  })
  @ApiResponse({ status: 404, description: 'Individual service price list entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateIndividualServicePriceListDto: UpdateIndividualServicePriceListDto,
  ): Promise<IndividualServicePriceList> {
    return this.individualServicePriceListService.update(id, updateIndividualServicePriceListDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an individual service price list entry (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Individual service price list entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Individual service price list entry not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.individualServicePriceListService.remove(id);
  }
}
