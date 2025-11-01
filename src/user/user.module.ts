import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

/**
 * User Module
 *
 * Encapsulates all user-related functionality.
 * Registers the User entity, provides the UserService,
 * and defines the UserController for HTTP requests.
 *
 * @module UserModule
 *
 * @description
 * This module is responsible for:
 * - Registering the User entity with TypeORM
 * - Providing the UserService to handle business logic
 * - Defining the UserController to handle HTTP requests
 * - Setting up dependency injection for all user-related operations
 *
 * @example
 * // In AppModule
 * import { UserModule } from './user/user.module';
 *
 * @Module({
 *   imports: [UserModule],
 * })
 * export class AppModule {}
 *
 * @exports {UserService} The user service can be injected in other modules
 */
@Module({
  // Import the TypeORM User entity repository
  // This allows UserService to use @InjectRepository(User)
  imports: [TypeOrmModule.forFeature([User])],

  // Controllers that handle HTTP requests
  // UserController will be automatically instantiated and available
  controllers: [UserController],

  // Services (providers) that contain business logic
  // These are automatically instantiated and injected where needed
  providers: [UserService],

  // Export services that can be used by other modules
  // By exporting UserService, other modules can import this module
  // and inject UserService into their own services/controllers
  exports: [UserService],
})
export class UserModule {}
