import { BadRequestException } from '@nestjs/common';

export class InvalidTypeException extends BadRequestException {
  constructor() {
    super({
      error_code: 'INVALID_TYPE',
      error_description: 'Tipo de medição não permitida',
    });
  }
}
