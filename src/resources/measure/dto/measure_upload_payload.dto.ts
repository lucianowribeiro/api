import {
  IsBase64,
  IsDate,
  IsDateString,
  IsIn,
  IsISO8601,
  IsNumber,
  IsString,
} from 'class-validator';

export class MeasureUploadPayloadDto {
  @IsString()
  customer_code: string;

  @IsDateString()
  measure_datetime: Date;

  @IsString()
  @IsIn(['WATER', 'GAS'])
  measure_type: 'WATER' | 'GAS';
}
