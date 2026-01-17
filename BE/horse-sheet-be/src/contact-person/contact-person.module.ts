import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactPersonService } from './contact-person.service';
import { ContactPersonController } from './contact-person.controller';
import { ContactPerson } from './entities/contact-person.entity';
import { Stable } from '../stable/entities/stable.entity';
import { Participant } from '../participant/entities/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactPerson, Stable, Participant])],
  controllers: [ContactPersonController],
  providers: [ContactPersonService],
  exports: [ContactPersonService],
})
export class ContactPersonModule {}
