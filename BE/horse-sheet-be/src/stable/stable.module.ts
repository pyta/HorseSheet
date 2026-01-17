import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StableService } from './stable.service';
import { StableController } from './stable.controller';
import { Stable } from './entities/stable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stable])],
  controllers: [StableController],
  providers: [StableService],
  exports: [StableService],
})
export class StableModule {}
