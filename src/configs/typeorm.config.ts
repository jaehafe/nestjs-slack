import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456789',
  database: 'slack',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  // autoLoadEntities: true,
  synchronize: true,
  logging: true,
  keepConnectionAlive: true,
  charset: 'utf8mb4',
};
