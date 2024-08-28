import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MeasureUploadPayloadDto } from './dto/measure_upload_payload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Measure } from './measure.entity';
import { Repository } from 'typeorm';
import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';

@Injectable()
export class MeasureService {
  constructor(
    @InjectRepository(Measure) private measureRepository: Repository<Measure>,
  ) {}

  async getMeasurebyMonthAndType(
    payload: MeasureUploadPayloadDto,
  ): Promise<Measure | null> {
    return this.measureRepository
      .createQueryBuilder('measure')
      .where('MONTH(measure.measure_datetime) = :month', {
        month: new Date(payload.measure_datetime).getMonth(),
      })
      .andWhere('YEAR(measure.measure_datetime) = :year', {
        year: new Date(payload.measure_datetime).getFullYear(),
      })
      .andWhere('YEAR(measure.measure_type) = :type', {
        type: payload.measure_type,
      })
      .getOne();
  }

  async measureImagetoLLM(image) {
    return '';
  }

  async save(payload: Measure): Promise<Measure> {
    return this.measureRepository.create(payload);
  }
}
