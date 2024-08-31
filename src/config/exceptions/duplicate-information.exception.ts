import { ConflictException } from '@nestjs/common';

type errorCodes = 'CONFIRMATION_DUPLICATE' | 'DOUBLE_REPORT';

export class DuplicateInformation extends ConflictException {
  constructor(error_code: errorCodes) {
    super({
      error_code,
      error_description: 'Leitura do mês já realizada',
    });
  }
}
