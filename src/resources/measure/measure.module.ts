import { Module } from '@nestjs/common';
import { MeasureController } from './measure.controller';
import { MeasureService } from './measure.service';
import { CustomerService } from '../customer/customer.service';
import { measureProviders } from './measure.provider';
import { DatabaseModule } from 'src/config/database/database.module';


@Module({
  imports: [DatabaseModule],
  controllers: [MeasureController],
  providers: [...measureProviders, MeasureService, CustomerService],
})
export class MeasureModule {}
