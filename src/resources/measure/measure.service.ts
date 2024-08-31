import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MeasureUploadDto } from './dto/measure-upload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Measure } from './measure.entity';
import { Between, In, InsertResult, Repository } from 'typeorm';
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

  async findByMonthAndType({
    customer_code,
    measure_datetime,
    measure_type,
  }: {
    customer_code: MeasureUploadDto['customer_code'];
    measure_type: MeasureUploadDto['measure_type'];
    measure_datetime: MeasureUploadDto['measure_datetime'];
  }) {
    const result = await this.customerRepository.findOne({
      where: {
        customer_code,
        measures: {
          measure_type,
          measure_datetime: Between(
            new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            new Date(measure_datetime),
          ),
        },
      },
      relations: {
        measures: true,
      },
    });

    if (result) {
      throw new DuplicateInformation('DOUBLE_REPORT');
    }

    return;
  }

  async measureImageByGoogleGenerativeAI({
    image,
  }: {
    image: MeasureUploadDto['image'];
  }) {
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
      measure_value: result.response.text(),
    };
  }

  async saveUpload({
    customer_code,
    measure_datetime,
    measure_type,
    image_url,
  }: {
    customer_code: string;
    measure_datetime: Date;
    measure_type: 'WATER' | 'GAS';
    image_url: string;
  }): Promise<Measure> {
    const measure = await this.measureRepository.save(
      this.measureRepository.create({
        measure_datetime,
        measure_type,
        image_url,
      }),
    );

    await this.customerRepository.save(
      this.customerRepository.create({ customer_code, measures: [measure] }),
    );

    return measure;
  }

  async findUuid({
    measure_uuid,
  }: {
    measure_uuid: MeasureConfirmDto['measure_uuid'];
  }): Promise<Measure> {
    return await this.measureRepository.findOneBy({ measure_uuid });
  }

  async findConfirmation(payload: MeasureConfirmDto) {
    const result = await this.measureRepository.findOneBy({
      measure_uuid: payload.measure_uuid,
      has_confirmed: Boolean(payload.confirmed_value),
    });

    if (result) throw new DuplicateInformation('CONFIRMATION_DUPLICATE');

    return;
  }

  async saveConfirmation(payload: MeasureConfirmDto) {
    await this.measureRepository.update(
      {
        measure_uuid: payload.measure_uuid,
      },
      {
        has_confirmed: Boolean(payload.confirmed_value),
      },
    );
  }

  async filterByType({
    measure_type,
    customer_code,
  }: MeasureListDto): Promise<Customer[]> {
    const result = await this.customerRepository.find({
      where: {
        customer_code,
        measures: {
          measure_type,
        },
      },
      relations: {
        measures: true,
      },
    });

    if (result.length <= 0)
      throw new NotFoundMeasureException('MEASURES_NOT_FOUND');
    return result;
  }

  async findAllByCustomer({
    customer_code,
  }: {
    customer_code: Customer['customer_code'];
  }): Promise<Customer[]> {
    const result = await this.customerRepository.find({
      where: {
        customer_code,
      },
      relations: {
        measures: true,
      },
    });

    if (result.length <= 0)
      throw new NotFoundMeasureException('MEASURES_NOT_FOUND');

    return result;
  }
}
