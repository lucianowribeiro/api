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

@Controller()
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('/upload')
  async uploadMeasure(@Body() payload: MeasureUploadDto) {
    this.measureService.isUniqueByMonthAndType(payload);
    /*  const { measure_value } =
      await this.measureService.measureImageByGoogleGenerativeAI(payload.image); */

    const measure = await this.measureService.save({
      ...payload,
      image_url: '/images',
    });
    return {
      measure_value: '',
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

    const confirmation = await this.measureService.findConfirmation();

    this.measureService.updateConfirmation(confirmation.measure_uuid);
    return {
      sucess: true,
    };
  }

  @Get('/:customer_code/list')
  async listAllMeasuresByCustomer(
    @Param('customer_code') customer_code: MeasureListDto['customer_code'],
    @Query('measure_type') measure_type: MeasureListDto['measure_type'],
  ): Promise<Customer> {
    if (measure_type) {
      return this.measureService.filterByType({ customer_code, measure_type });
    }
    return await this.measureService.findAllByCustomer({ customer_code });
  }
}
