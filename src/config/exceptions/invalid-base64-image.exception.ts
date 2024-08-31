import { BadRequestException } from '@nestjs/common';

export class InvalidBase64ImageException extends BadRequestException {
  constructor() {
    super({
      error_code: 'INVALID_DATA',
      error_description: 'image is not base64 encoding format',
    });
  }
}
