import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MeasureUploadDto } from './dto/measure-upload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Measure } from './measure.entity';
import { InsertResult, Repository } from 'typeorm';
import { DuplicateInformation } from 'src/config/exceptions/duplicate-information.exception';
import { MeasureListDto } from './dto/measure-list.dto';
import { NotFoundMeasureException } from 'src/config/exceptions/not-found-measure.exception';
import { MeasureConfirmDto } from './dto/measure-confirm.dto';
import { InvalidFormatImageException } from 'src/config/exceptions/invalid-format-image.exception';
import { isBase64 } from 'class-validator';
import { InvalidBase64ImageException } from 'src/config/exceptions/invalid-base64-image.exception';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Customer } from '../customer/customer.entity';
@Injectable()
export class MeasureService {
  constructor(
    @Inject('MEASURE_REPOSITORY')
    private measureRepository: Repository<Measure>,
    @Inject('CUSTOMER_REPOSITORY')
    private customerRepository: Repository<Customer>,
  ) {}

  isValidImage(image: MeasureUploadDto['image']) {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/heic',
      'image/heif',
    ];
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    if (!isBase64(base64Data)) throw new InvalidBase64ImageException();

    const mimeTypeMatch = image.match(
      /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?.*,.*/,
    );
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : null;

    if (!allowedMimeTypes.includes(mimeType))
      throw new InvalidFormatImageException();

    return { format: mimeType.split('/')[1], mimeType, base64Data };
  }

  async isUniqueByMonthAndType(payload: MeasureUploadDto) {
    const result = await this.measureRepository
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

    if (result) {
      throw new DuplicateInformation('DOUBLE_REPORT');
    }
    return;
  }

  async measureImageByGoogleGenerativeAI(image: MeasureUploadDto['image']) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
    });
    const { format, mimeType, base64Data } = this.isValidImage(image);

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
      {
        text: 'Extract measure value',
      },
    ]);
    if (!result) {
      return {
        measure_value: '',
      };
    }

    return {
      measure_value: result.response.text().match('/d+'),
    };
  }

  async save({
    image,
    customer_code,
    measure_datetime,
    measure_type,
    image_url,
  }: {
    image: string;
    customer_code: string;
    measure_datetime: Date;
    measure_type: 'WATER' | 'GAS';
    image_url: string;
  }): Promise<Measure> {
    const payload = {
      image,
      customer_code,
      measure_datetime,
      measure_type,
      image_url,
    };
    const customer = this.customerRepository.create(payload);
    this.customerRepository.save(customer);

    const measure = this.measureRepository.create(payload);
    return await this.measureRepository.save(measure);
  }

  async findUuid(
    measure_uuid: MeasureConfirmDto['measure_uuid'],
  ): Promise<Measure> {
    return this.measureRepository.findOneBy({ measure_uuid });
  }

  async findConfirmation() {
    const result = this.measureRepository.findOneBy({ has_confirmed: false });

    if (!result) throw new DuplicateInformation('CONFIRMATION_DUPLICATE');

    return result;
  }

  updateConfirmation(measure_uuid: Measure['measure_uuid']) {
    this.measureRepository.update(
      { measure_uuid },
      {
        has_confirmed: true,
      },
    );
  }

  async filterByType({ customer_code, measure_type }: MeasureListDto) {
    const result = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect(
        'customer.measures',
        'measure',
        'measure.measure_type = :measure_type',
        {
          measure_type,
        },
      )
      .where('customer.customer_code = :customer_code', { customer_code })
      .getOne();

    if (!result) throw new NotFoundMeasureException('MEASURES_NOT_FOUND');
    return result;
  }

  async findAllByCustomer({
    customer_code,
  }: {
    customer_code: MeasureListDto['customer_code'];
  }): Promise<Customer> {
    const result = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.measures', 'measure')
      .where('customer.customer_code = :customer_code', { customer_code })
      .getOne();

    if (!result) throw new NotFoundMeasureException('MEASURES_NOT_FOUND');

    return result;
  }
}
