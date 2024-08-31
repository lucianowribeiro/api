import {
  IsBase64,
  IsDateString,
  IsIn,
  IsMimeType,
  IsString,
} from 'class-validator';

export class MeasureUploadDto {
  /**
   * Imagem a ser medida e analisada pela LLM,deve ser em string codificada em base 64
   */
  @IsString()
  image: string;
  /**
   * Codigo do cliente
   * @example 001
   */
  @IsString()
  customer_code: string;

  /**
   *  Data em string em formato ISO
   * Se o mes desta data ja tiver um registro de um determinado tipo ,lança um excecao
   * @example 2024-08-30T12:47:02.124Z
   * @throws AAA
   */
  @IsDateString()
  measure_datetime: Date;
  /**
   * O tipo da medicao a ser analisada somente nestes dois casos.
   * Se houver uma medicao de um tipo ja feita no mesmo mes,lança um excecao
   * @throws AAAAAA
   */
  @IsString()
  @IsIn(['WATER', 'GAS'])
  measure_type: 'WATER' | 'GAS';
}
