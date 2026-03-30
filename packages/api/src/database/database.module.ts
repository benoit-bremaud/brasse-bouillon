import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeorm.config';

/**
 * Database Module
 *
 * Central module that configures and provides the database connection.
 * Registers TypeORM with the application and makes it available to all other modules.
 *
 * @module DatabaseModule
 *
 * @example
 * // In AppModule
 * import { DatabaseModule } from './database/database.module';
 *
 * @Module({
 *   imports: [DatabaseModule],
 * })
 * export class AppModule {}
 *
 * @description
 * This module is responsible for:
 * - Initializing the SQLite database connection
 * - Registering all TypeORM entities
 * - Providing database access to other modules
 * - Managing database synchronization in development mode
 */
@Module({
  imports: [
    // Initialize TypeORM with the configuration from typeorm.config.ts
    TypeOrmModule.forRoot(typeOrmConfig()),
  ],
})
export class DatabaseModule {}
