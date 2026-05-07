import 'reflect-metadata';

import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from './typeorm.config';

// CLI mode: do not auto-run pending migrations before executing the requested
// TypeORM command (migration:generate, migration:revert, etc.).
const dataSource = new DataSource(buildTypeOrmOptions({ forCli: true }));

export default dataSource;
