import { IsInt, IsNumber, IsUUID } from 'class-validator';
import { IntegerType } from 'typeorm';

export class MeasureConfirmDto {
  /**
   * Uuid do registro
   */
  @IsUUID()
  measure_uuid: string;
  /**
   * Valor que guarda a informação se o registro ja foi confirmado
   * 0 - para não confirmado
   * 1 - para confirmado
   * @default 0
   */
  @IsInt()
  confirmed_value: number;
}
