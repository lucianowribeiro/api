import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database/database.module';
import { MeasureModule } from 'src/resources/measure/measure.module';

@Module({
  imports: [DatabaseModule, MeasureModule],
})
export class AppModule {}
