import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Measure } from '../measure/measure.entity';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  customer_code: string;

  @OneToMany(() => Measure, (measure) => measure.customer)
  measures: Measure[];
}
