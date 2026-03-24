import { IsUniqueEmailConstraint } from './validators/is-unique-email.validator';
import { IsUniqueUsernameConstraint } from './validators/is-unique-username.validator';
import { Module } from '@nestjs/common';
import { PasswordService } from '../auth/services/password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

/**
 * User Module
 *
 * Encapsulates all user-related functionality including authentication,
 * profile management, and custom validation.
 *
 * Features:
 * - User entity registration with TypeORM
 * - Complete CRUD operations via UserService
 * - HTTP request handling via UserController
 * - Custom async validators for email/username uniqueness
 * - Password hashing and verification via PasswordService
 * - Dependency injection configuration
 *
 * Responsibilities:
 * - Register User entity with TypeORM (database access)
 * - Provide UserService for business logic
 * - Register custom validators for DTO validation
 * - Register PasswordService for secure password operations
 * - Define UserController for HTTP request handling
 * - Export services to other modules that need them
 *
 * Dependencies:
 * - PasswordService: Injected into UserService for password hashing/verification
 * - TypeORM: Database abstraction layer
 * - class-validator: DTO validation
 *
 * Exports:
 * - UserService: Can be imported by other modules
 *
 * Usage:
 * ```
 * // In AppModule or other modules
 * @Module({
 *   imports: [UserModule],
 * })
 * export class SomeModule {}
 *
 * // Then inject UserService in any service/controller in that module
 * constructor(private readonly userService: UserService) {}
 * ```
 *
 * @module UserModule
 * @decorator @Module() Defines a NestJS module
 *
 * @example
 * // Module is automatically imported in AppModule
 * // Services are injected via constructor dependency injection
 */
@Module({
  // ============================================================================
  // 📦 IMPORTS
  // ============================================================================

  /**
   * TypeORM Feature Module Registration
   *
   * Registers the User entity with TypeORM.
   * This allows:
   * - Automatic repository creation (@InjectRepository(User))
   * - Database table schema management
   * - Query builder access
   * - Entity relationships
   *
   * Note: TypeORM global config is in DatabaseModule
   */
  imports: [TypeOrmModule.forFeature([User])],

  // ============================================================================
  // 🎮 CONTROLLERS
  // ============================================================================

  /**
   * HTTP Request Handlers
   *
   * UserController:
   * - Handles all user-related HTTP requests
   * - Routes to appropriate UserService methods
   * - Validates input using DTOs
   * - Transforms responses using interceptors
   *
   * Automatically instantiated and registered by NestJS
   */
  controllers: [UserController],

  // ============================================================================
  // 🔧 PROVIDERS (Services & Constraints)
  // ============================================================================

  /**
   * Application Services & Validators
   *
   * Providers registered here are:
   * - Instantiated as singletons by NestJS
   * - Available for dependency injection in this module
   * - Can be exported for use in other modules
   *
   * Providers:
   *
   * 1. UserService
   *    - Core business logic for user operations
   *    - CRUD operations (create, read, update, delete)
   *    - Password management
   *    - Depends on: PasswordService, TypeORM User repository
   *
   * 2. PasswordService
   *    - Password hashing with bcrypt
   *    - Password verification
   *    - Injected into UserService for secure password handling
   *    - Security: Never returns plain-text passwords
   *
   * 3. IsUniqueEmailConstraint
   *    - Custom validator for @IsUniqueEmail() decorator
   *    - Checks if email is unique in database
   *    - Used in: CreateUserDto, UpdateUserDto
   *    - Async: Queries database
   *
   * 4. IsUniqueUsernameConstraint
   *    - Custom validator for @IsUniqueUsername() decorator
   *    - Checks if username is unique in database
   *    - Used in: CreateUserDto, UpdateUserDto
   *    - Async: Queries database
   *
   * IMPORTANT: All custom validators must be registered here
   * so they can use dependency injection
   */
  providers: [
    UserService, // Core service
    PasswordService, // ✅ Password hashing/verification
    IsUniqueEmailConstraint, // Custom validator
    IsUniqueUsernameConstraint, // Custom validator
  ],

  // ============================================================================
  // 📤 EXPORTS
  // ============================================================================

  /**
   * Module Exports - Available to Other Modules
   *
   * When a module imports UserModule, it can inject:
   * - UserService: For user operations
   *
   * Example:
   * ```
   * @Module({
   *   imports: [UserModule],
   * })
   * export class RecipesModule {
   *   // UserService is now available for injection
   *   constructor(private readonly userService: UserService) {}
   * }
   * ```
   *
   * Note: PasswordService is NOT exported because it's internal to UserModule
   * Custom validators are NOT exported because they're only used here
   */
  exports: [UserService],
})
export class UserModule {}
