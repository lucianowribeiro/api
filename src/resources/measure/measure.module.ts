import { Module } from '@nestjs/common';
import { MeasureService } from './measure.service';
import { MeasureController } from './measure.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measure } from './measure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Measure])],
  controllers: [MeasureController],
  providers: [MeasureService],
})
export class MeasureModule {}
