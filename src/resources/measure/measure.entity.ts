import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../customer/customer.entity';

enum MeasureTypes {
  WATER = 'WATER',
  GAS = 'GAS',
}

@Entity('measure')
export class Measure {
  @PrimaryGeneratedColumn('uuid')
  measure_uuid: string;

  @Column()
  measure_datetime: Date;

  @Column('enum', { enum: MeasureTypes })
  measure_type: string;

  @Column({ default: false })
  has_confirmed: boolean;

  @Column()
  image_url: string;

  @ManyToOne(() => Customer, (customer) => customer.customer_code)
  @JoinColumn({
    name: 'customer_code',
    referencedColumnName: 'customer_code',
  })
  customer: Customer;
}
