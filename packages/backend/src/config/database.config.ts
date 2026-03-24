import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from '../database/typeorm.config';

export const databaseConfig = (): TypeOrmModuleOptions => buildTypeOrmOptions();
