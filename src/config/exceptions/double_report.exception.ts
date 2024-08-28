import { ConflictException } from '@nestjs/common';

export class DoubleReportException extends ConflictException {
  constructor() {
    super({
      error_code: 'DOUBLE_REPORT',
      error_description: 'Leitura do mês já realizada',
    });
  }
}
