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
import { StableService } from './stable.service';
import { CreateStableDto } from './dto/create-stable.dto';
import { UpdateStableDto } from './dto/update-stable.dto';
import { Stable } from './entities/stable.entity';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('stables')
@Controller('stables')
export class StableController {
  constructor(private readonly stableService: StableService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stable' })
  @ApiResponse({ status: 201, description: 'Stable created successfully', type: Stable })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createStableDto: CreateStableDto): Promise<Stable> {
    return this.stableService.create(createStableDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stables' })
  @ApiResponse({ status: 200, description: 'List of stables', type: [Stable] })
  findAll(): Promise<Stable[]> {
    return this.stableService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a stable by ID (public)' })
  @ApiResponse({ status: 200, description: 'Stable details', type: Stable })
  @ApiResponse({ status: 404, description: 'Stable not found' })
  findOne(@Param('id') id: string): Promise<Stable> {
    return this.stableService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a stable' })
  @ApiResponse({ status: 200, description: 'Stable updated successfully', type: Stable })
  @ApiResponse({ status: 404, description: 'Stable not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateStableDto: UpdateStableDto,
  ): Promise<Stable> {
    return this.stableService.update(id, updateStableDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a stable (soft delete)' })
  @ApiResponse({ status: 204, description: 'Stable deleted successfully' })
  @ApiResponse({ status: 404, description: 'Stable not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.stableService.remove(id);
  }
}
