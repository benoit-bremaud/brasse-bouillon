import 'reflect-metadata';

import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from './typeorm.config';

const dataSource = new DataSource(buildTypeOrmOptions());

export default dataSource;
