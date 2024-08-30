import { DataSource } from 'typeorm';
import { Measure } from './measure.entity';
import { Customer } from '../customer/customer.entity';

export const measureProviders = [
  {
    provide: 'MEASURE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Measure),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CUSTOMER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Customer),
    inject: ['DATA_SOURCE'],
  },
];
