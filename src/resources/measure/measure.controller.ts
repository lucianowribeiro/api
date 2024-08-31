import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { MeasureUploadDto } from './dto/measure-upload.dto';
import { MeasureConfirmDto } from './dto/measure-confirm.dto';
import { MeasureListDto } from './dto/measure-list.dto';
import { NotFoundMeasureException } from 'src/config/exceptions/not-found-measure.exception';
import { Customer } from '../customer/customer.entity';

@Controller()
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('/upload')
  async uploadMeasure(
    @Body()
    { customer_code, image, measure_datetime, measure_type }: MeasureUploadDto,
  ) {
    this.measureService.findByMonthAndType({
      customer_code,
      measure_datetime,
      measure_type,
    });
    const { measure_value } =
      await this.measureService.measureImageByGoogleGenerativeAI({ image });

    const { image_url, measure_uuid } = await this.measureService.saveUpload({
      customer_code,
      measure_datetime,
      measure_type,
      image_url: '/images',
    });
    return {
      measure_value,
      image_url,
      measure_uuid,
    };
  }

  @Patch('/confirm')
  async confirmMeasure(
    @Body() { confirmed_value, measure_uuid }: MeasureConfirmDto,
  ) {
    const foundMeasure = await this.measureService.findUuid({ measure_uuid });
    if (!foundMeasure) throw new NotFoundMeasureException('MEASURE_NOT_FOUND');

    await this.measureService.findConfirmation({
      confirmed_value,
      measure_uuid,
    });

    this.measureService.saveConfirmation({ measure_uuid, confirmed_value });

    return {
      sucess: true,
    };
  }

  @Get('/:customer_code/list')
  async listAllMeasuresByCustomer(
    @Param('customer_code') customer_code: MeasureListDto['customer_code'],
    @Query('measure_type') measure_type: MeasureListDto['measure_type'],
  ): Promise<Customer[]> {
    if (measure_type) {
      return this.measureService.filterByType({ measure_type, customer_code });
    }
    return await this.measureService.findAllByCustomer({ customer_code });
  }
}
