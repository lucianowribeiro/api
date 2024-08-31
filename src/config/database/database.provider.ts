import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'database',
        port: 3306,
        username: 'root',
        password: 'root',
        connectTimeout: 60 * 60 * 1000,
        database: 'app',
        entities: [__dirname + '/../../**/**/*.entity{.ts,.js}'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
