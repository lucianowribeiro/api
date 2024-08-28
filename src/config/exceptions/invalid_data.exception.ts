import { BadRequestException, ValidationError } from '@nestjs/common';

export class InvalidDataException extends BadRequestException {
  constructor(errors: ValidationError[] | string) {
    super({
      error_code: 'INVALID_DATA',
      error_description:
        typeof errors === 'string'
          ? errors
          : errors.map((error) => ({
              [error.property]: Object.values(error.constraints),
            })),
    });
  }
}
