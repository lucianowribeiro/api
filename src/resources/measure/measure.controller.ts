import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  Query,
  Response,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { MeasureUploadDto } from './dto/measure-upload.dto';
import { MeasureConfirmDto } from './dto/measure-confirm.dto';
import { MeasureListDto } from './dto/measure-list.dto';
import { NotFoundMeasureException } from 'src/config/exceptions/not-found-measure.exception';
import { Customer } from '../customer/customer.entity';
import { randomUUID } from 'crypto';
import { Measure } from './measure.entity';

@Controller()
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('/upload')
  async uploadMeasure(@Body() payload: MeasureUploadDto) {
    this.measureService.isUniqueByMonthAndType(payload);
    const { measure_value } =
      await this.measureService.measureImageByGoogleGenerativeAI(payload.image);

    const measure = await this.measureService.saveUpload({
      customer_code: payload.customer_code,
      measure_datetime: payload.measure_datetime,
      measure_type: payload.measure_type,
      image_url: '/images',
    });
    return {
      measure_value,
      measure_url: measure.image_url,
      measure_uuid: measure.measure_uuid,
    };
  }

  @Patch('/confirm')
  async confirmMeasure(@Body() payload: MeasureConfirmDto) {
    const foundMeasure = await this.measureService.findUuid(
      payload.measure_uuid,
    );
    if (!foundMeasure) throw new NotFoundMeasureException('MEASURE_NOT_FOUND');

    await this.measureService.findConfirmation(payload);

    this.measureService.saveConfirmation(payload);

    return {
      sucess: true,
    };
  }

  @Get('/:customer_code/list')
  async listAllMeasuresByCustomer(
    @Param('customer_code') customer_code: MeasureListDto['customer_code'],
    @Query('measure_type') measure_type: MeasureListDto['measure_type'],
  ): Promise<Measure[]> {
    if (measure_type) {
      return this.measureService.filterByType(measure_type);
    }
    return await this.measureService.findAllByCustomer();
  }
}
