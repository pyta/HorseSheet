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
import { StableService } from './stable.service';
import { CreateStableDto } from './dto/create-stable.dto';
import { UpdateStableDto } from './dto/update-stable.dto';
import { Stable } from './entities/stable.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('stables')
@ApiBearerAuth()
@Controller('stables')
@UseGuards(RolesGuard)
@Roles('admin', 'stable_owner')
export class StableController {
  constructor(private readonly stableService: StableService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stable' })
  @ApiResponse({ status: 201, description: 'Stable created successfully', type: Stable })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createStableDto: CreateStableDto,
    @CurrentUser() user: { userId: string; roles: string[]; stableIds: string[] },
  ): Promise<Stable> {
    return this.stableService.create(createStableDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stables (filtered by access for SO)' })
  @ApiResponse({ status: 200, description: 'List of stables', type: [Stable] })
  findAll(
    @CurrentUser() user: { userId: string; roles: string[]; stableIds: string[] },
  ): Promise<Stable[]> {
    return this.stableService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stable by ID' })
  @ApiResponse({ status: 200, description: 'Stable details', type: Stable })
  @ApiResponse({ status: 404, description: 'Stable not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; roles: string[]; stableIds: string[] },
  ): Promise<Stable> {
    return this.stableService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a stable' })
  @ApiResponse({ status: 200, description: 'Stable updated successfully', type: Stable })
  @ApiResponse({ status: 404, description: 'Stable not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateStableDto: UpdateStableDto,
    @CurrentUser() user: { userId: string; roles: string[]; stableIds: string[] },
  ): Promise<Stable> {
    return this.stableService.update(id, updateStableDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a stable (soft delete)' })
  @ApiResponse({ status: 204, description: 'Stable deleted successfully' })
  @ApiResponse({ status: 404, description: 'Stable not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; roles: string[]; stableIds: string[] },
  ): Promise<void> {
    return this.stableService.remove(id, user);
  }
}
