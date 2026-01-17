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
import { PriceListService } from './price-list.service';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';
import { PriceList } from './entities/price-list.entity';

@ApiTags('price-lists')
@Controller('price-lists')
export class PriceListController {
  constructor(private readonly priceListService: PriceListService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new price list entry' })
  @ApiResponse({
    status: 201,
    description: 'Price list entry created successfully',
    type: PriceList,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createPriceListDto: CreatePriceListDto): Promise<PriceList> {
    return this.priceListService.create(createPriceListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all price list entries' })
  @ApiResponse({
    status: 200,
    description: 'List of price list entries',
    type: [PriceList],
  })
  findAll(): Promise<PriceList[]> {
    return this.priceListService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a price list entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Price list entry details',
    type: PriceList,
  })
  @ApiResponse({ status: 404, description: 'Price list entry not found' })
  findOne(@Param('id') id: string): Promise<PriceList> {
    return this.priceListService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a price list entry' })
  @ApiResponse({
    status: 200,
    description: 'Price list entry updated successfully',
    type: PriceList,
  })
  @ApiResponse({ status: 404, description: 'Price list entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updatePriceListDto: UpdatePriceListDto,
  ): Promise<PriceList> {
    return this.priceListService.update(id, updatePriceListDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a price list entry (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Price list entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Price list entry not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.priceListService.remove(id);
  }
}
