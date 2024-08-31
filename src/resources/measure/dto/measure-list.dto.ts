import { IsIn, IsOptional, IsString } from 'class-validator';

enum MeasuresTypes {
  WATER = 'WATER',
  GAS = 'WATER',
}

export class MeasureListDto {
  /**
   * Codigo do cliente a ser pesquisado na lista de leituras
   * @param
   * @example 001
   */
  @IsString()
  customer_code: string;
  /**
   * Opcionalmente usado para filtrar pelo tipo da leitura
   * @param
   * @example water
   */
  @IsString()
  @IsOptional()
  @IsIn(['WATER', 'GAS'])
  measure_type: string;
}
