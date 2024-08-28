import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { MeasureUploadPayloadDto } from './dto/measure_upload_payload.dto';
import { DoubleReportException } from '../../config/exceptions/double_report.exception';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { isBase64 } from 'class-validator';
import { readFileSync } from 'fs';
import { InvalidDataException } from '../../config/exceptions/invalid_data.exception';

@Controller('/measure')
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadMeasure(
    @UploadedFile() image: Express.Multer.File,
    @Body() payload: MeasureUploadPayloadDto,
  ) {
    if (!isBase64(Buffer.from(image.buffer).toString('base64')))
      throw new InvalidDataException('image is not base64 encoding format');

    if (!this.measureService.getMeasurebyMonthAndType(payload)) {
      throw new DoubleReportException();
    }

    const measure_value = await this.measureService.measureImagetoLLM(image);

    // return this.measureService.save({ ...payload, image_url, measure_value });

    return image;
  }
}
