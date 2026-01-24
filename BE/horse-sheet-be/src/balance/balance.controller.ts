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
import { BalanceService } from './balance.service';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { Balance } from './entities/balance.entity';

@ApiTags('balances')
@Controller('balances')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new balance' })
  @ApiResponse({
    status: 201,
    description: 'Balance created successfully',
    type: Balance,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createBalanceDto: CreateBalanceDto): Promise<Balance> {
    return this.balanceService.create(createBalanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all balances' })
  @ApiResponse({
    status: 200,
    description: 'List of balances',
    type: [Balance],
  })
  findAll(): Promise<Balance[]> {
    return this.balanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a balance by ID' })
  @ApiResponse({
    status: 200,
    description: 'Balance details',
    type: Balance,
  })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  findOne(@Param('id') id: string): Promise<Balance> {
    return this.balanceService.findOne(id);
  }

  @Get('contact-person/:contactPersonId')
  @ApiOperation({ summary: 'Get balance by contact person ID' })
  @ApiResponse({
    status: 200,
    description: 'Balance details',
    type: Balance,
  })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  findByContactPersonId(
    @Param('contactPersonId') contactPersonId: string,
  ): Promise<Balance | null> {
    return this.balanceService.findByContactPersonId(contactPersonId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a balance' })
  @ApiResponse({
    status: 200,
    description: 'Balance updated successfully',
    type: Balance,
  })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ): Promise<Balance> {
    return this.balanceService.update(id, updateBalanceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a balance (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Balance deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.balanceService.remove(id);
  }
}

