import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/resources/measure/customer.entity';
import { Measure } from 'src/resources/measure/measure.entity';
import { DataSource } from 'typeorm';
import { MeasureModule } from 'src/resources/measure/measure.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'database',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'app',
      entities: [Measure, Customer],
      synchronize: true,
    }),
    MeasureModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
