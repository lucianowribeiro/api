import { BadRequestException, ValidationError } from '@nestjs/common';

export class InvalidDataException extends BadRequestException {
  constructor(errors: ValidationError[]) {
    super({
      error_code: 'INVALID_DATA',
      error_description: errors.map((error) => ({
        [error.property]: Object.values(error.constraints),
      })),
    });
  }
}
