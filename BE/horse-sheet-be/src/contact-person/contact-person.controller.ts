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
import { ContactPersonService } from './contact-person.service';
import { CreateContactPersonDto } from './dto/create-contact-person.dto';
import { UpdateContactPersonDto } from './dto/update-contact-person.dto';
import { ContactPerson } from './entities/contact-person.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('contact-persons')
@ApiBearerAuth()
@Controller('contact-persons')
@UseGuards(RolesGuard)
@Roles('admin', 'stable_owner', 'stable_manager')
export class ContactPersonController {
  constructor(
    private readonly contactPersonService: ContactPersonService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact person' })
  @ApiResponse({
    status: 201,
    description: 'Contact person created successfully',
    type: ContactPerson,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createContactPersonDto: CreateContactPersonDto,
  ): Promise<ContactPerson> {
    return this.contactPersonService.create(createContactPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contact persons' })
  @ApiResponse({
    status: 200,
    description: 'List of contact persons',
    type: [ContactPerson],
  })
  findAll(): Promise<ContactPerson[]> {
    return this.contactPersonService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact person by ID' })
  @ApiResponse({
    status: 200,
    description: 'Contact person details',
    type: ContactPerson,
  })
  @ApiResponse({ status: 404, description: 'Contact person not found' })
  findOne(@Param('id') id: string): Promise<ContactPerson> {
    return this.contactPersonService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact person' })
  @ApiResponse({
    status: 200,
    description: 'Contact person updated successfully',
    type: ContactPerson,
  })
  @ApiResponse({ status: 404, description: 'Contact person not found' })
  @ApiResponse({ status: 409, description: 'Conflict - version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateContactPersonDto: UpdateContactPersonDto,
  ): Promise<ContactPerson> {
    return this.contactPersonService.update(id, updateContactPersonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a contact person (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Contact person deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Contact person not found' })
  @ApiResponse({ status: 400, description: 'Contact person is in use' })
  remove(@Param('id') id: string): Promise<void> {
    return this.contactPersonService.remove(id);
  }
}
