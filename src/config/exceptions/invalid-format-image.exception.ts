import { BadRequestException } from '@nestjs/common';

export class InvalidFormatImageException extends BadRequestException {
  constructor() {
    super({
      error_code: 'INVALID_DATA',
      error_description:
        'file is not a image or is not a image format allowed(PNG,JPEG,WEBP,HEIC,HEIF)',
    });
  }
}
