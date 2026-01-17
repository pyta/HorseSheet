import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { Participant } from './entities/participant.entity';
import { Stable } from '../stable/entities/stable.entity';
import { ContactPerson } from '../contact-person/entities/contact-person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participant, Stable, ContactPerson])],
  controllers: [ParticipantController],
  providers: [ParticipantService],
  exports: [ParticipantService],
})
export class ParticipantModule {}
