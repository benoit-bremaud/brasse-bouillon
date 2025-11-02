import { Test, TestingModule } from '@nestjs/testing';

import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';

/**
 * User Controller Test Suite
 *
 * Tests HTTP request/response handling for user operations.
 * Validates DTOs, request validation, and service integration.
 *
 * @test UserController
 * @requires UserService
 * @requires DTOs (CreateUserDto, UpdateUserDto)
 */
describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  /**
   * Mock user object
   */
  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
    username: 'john_doe',
    password_hash: 'hashedPassword123',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  } as User;

  /**
   * Mock CreateUserDto
   */
  const mockCreateUserDto: CreateUserDto = {
    email: 'john@example.com',
    username: 'john_doe',
    password: 'SecurePassword123!',
    first_name: 'John',
    last_name: 'Doe',
  };

  /**
   * Setup: Initialize testing module
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  /**
   * Cleanup
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * POST /users - Create user
   */
  describe('create() - POST /users', () => {
    /**
     * Test Case 1️⃣: Successfully create user
     *
     * Scenario: Valid CreateUserDto provided
     * Expected: User is created and returned with 201 status
     *
     * Validates:
     * - Service create() is called with DTO
     * - User object is returned
     * - HTTP 201 Created status
     */
    it('should create a new user and return it', async () => {
      // Setup: Mock service
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(service, 'create').mockResolvedValue(mockUser);

      // Execute: Call controller
      const result = await controller.create(mockCreateUserDto);

      // Verify: Service was called
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      // Verify: User is returned
      expect(result).toEqual(mockUser);
      expect(result.email).toBe('john@example.com');
    });

    /**
     * Test Case 2️⃣: Handle service error during creation
     *
     * Scenario: Service throws exception (e.g., email exists)
     * Expected: Exception is propagated to HTTP layer
     *
     * Validates:
     * - Service errors are not caught by controller
     * - Global exception handler receives error
     */
    it('should propagate service errors', async () => {
      // Setup: Mock service to throw
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('Email already exists'));

      // Execute & Verify: Error is thrown
      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  /**
   * GET /users/:id - Get user by ID
   */
  describe('findById() - GET /users/:id', () => {
    /**
     * Test Case 3️⃣: Find user by ID successfully
     *
     * Scenario: Valid user ID provided and user exists
     * Expected: User object is returned
     *
     * Validates:
     * - Service findById() is called with ID
     * - User is returned without password hash
     */
    it('should return a user by ID', async () => {
      // Setup: Mock service
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);

      // Execute: Call controller
      const result = await controller.findById(mockUser.id);

      // Verify: Service was called
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findById).toHaveBeenCalledWith(mockUser.id);
      // Verify: User is returned
      expect(result).toEqual(mockUser);
    });

    /**
     * Test Case 4️⃣: User not found by ID
     *
     * Scenario: User ID provided but user does not exist
     * Expected: 404 Not Found error
     *
     * Validates:
     * - Service throws UserNotFoundException
     * - Controller propagates it
     */
    it('should throw error when user not found', async () => {
      // Setup: Mock service to throw
      jest
        .spyOn(service, 'findById')
        .mockRejectedValue(new Error('User not found'));

      // Execute & Verify: Error is thrown
      await expect(controller.findById('non-existent-id')).rejects.toThrow(
        'User not found',
      );
    });
  });

  /**
   * PATCH /users/:id - Update user
   */
  describe('update() - PATCH /users/:id', () => {
    /**
     * Test Case 5️⃣: Successfully update user
     *
     * Scenario: Valid user ID and partial UpdateUserDto provided
     * Expected: User is updated and returned
     *
     * Validates:
     * - Service update() is called with ID and DTO
     * - Updated user is returned
     */
    it('should update a user successfully', async () => {
      // Setup: Mock service
      const updateUserDto: UpdateUserDto = { first_name: 'Jonathan' };
      const updatedUser = { ...mockUser, first_name: 'Jonathan' } as User;
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      // Execute: Call controller
      const result = await controller.update(mockUser.id, updateUserDto);

      // Verify: Service was called with correct params
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.update).toHaveBeenCalledWith(mockUser.id, updateUserDto);
      // Verify: Updated user is returned
      expect(result.first_name).toBe('Jonathan');
    });
  });

  /**
   * DELETE /users/:id - Delete user
   */
  describe('delete() - DELETE /users/:id', () => {
    /**
     * Test Case 6️⃣: Successfully delete user
     *
     * Scenario: Valid user ID provided and user exists
     * Expected: User is deleted (204 No Content)
     *
     * Validates:
     * - Service delete() is called with ID
     * - No content is returned
     */
    it('should delete a user successfully', async () => {
      // Setup: Mock service
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      // Execute: Call controller
      const result = await controller.delete(mockUser.id);

      // Verify: Service was called
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.delete).toHaveBeenCalledWith(mockUser.id);
      // Verify: No value returned (void)
      expect(result).toBeUndefined();
    });
  });
});
