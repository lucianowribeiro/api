import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Measure } from './measure.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  customer_uuid: string;

  @Column({ unique: true })
  customer_code: number;

  @OneToMany(() => Measure, (measure) => measure.customer)
  measures: Measure;
}
