import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Role } from '../auth/entities/role.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(RolesGuard)
@Roles('admin')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles', type: [Role] })
  findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({ status: 200, description: 'Role details', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOne(@Param('id') id: string): Promise<Role> {
    return this.roleService.findOne(id);
  }
}

