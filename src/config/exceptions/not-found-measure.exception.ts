import { NotFoundException } from '@nestjs/common';
import { EntityMetadataNotFoundError } from 'typeorm';

type ErrorCodes = 'MEASURE_NOT_FOUND' | 'MEASURES_NOT_FOUND';

export class NotFoundMeasureException extends NotFoundException {
  constructor(error_code: ErrorCodes) {
    super({
      error_code: error_code,
      error_description:
        error_code === 'MEASURE_NOT_FOUND'
          ? 'Leitura não encontrada'
          : 'Nenhuma leitura encontrada',
    });
  }
}
