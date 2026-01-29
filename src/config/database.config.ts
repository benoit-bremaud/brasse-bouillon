import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'data/brasse-bouillon.db',
  entities: [User],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
};
