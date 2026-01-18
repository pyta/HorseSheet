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
import { ServicePriceListService } from './service-price-list.service';
import { CreateServicePriceListDto } from './dto/create-service-price-list.dto';
import { UpdateServicePriceListDto } from './dto/update-service-price-list.dto';
import { ServicePriceList } from './entities/service-price-list.entity';

@ApiTags('service-price-lists')
@Controller('service-price-lists')
export class ServicePriceListController {
  constructor(private readonly servicePriceListService: ServicePriceListService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service price list entry' })
  @ApiResponse({
    status: 201,
    description: 'Service price list entry created successfully',
    type: ServicePriceList,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createServicePriceListDto: CreateServicePriceListDto): Promise<ServicePriceList> {
    return this.servicePriceListService.create(createServicePriceListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service price list entries' })
  @ApiResponse({
    status: 200,
    description: 'List of service price list entries',
    type: [ServicePriceList],
  })
  findAll(): Promise<ServicePriceList[]> {
    return this.servicePriceListService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service price list entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Service price list entry details',
    type: ServicePriceList,
  })
  @ApiResponse({ status: 404, description: 'Service price list entry not found' })
  findOne(@Param('id') id: string): Promise<ServicePriceList> {
    return this.servicePriceListService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service price list entry' })
  @ApiResponse({
    status: 200,
    description: 'Service price list entry updated successfully',
    type: ServicePriceList,
  })
  @ApiResponse({ status: 404, description: 'Service price list entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateServicePriceListDto: UpdateServicePriceListDto,
  ): Promise<ServicePriceList> {
    return this.servicePriceListService.update(id, updateServicePriceListDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service price list entry (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Service price list entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Service price list entry not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.servicePriceListService.remove(id);
  }
}
