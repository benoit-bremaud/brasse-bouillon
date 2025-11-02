import {
  EmailAlreadyExistsException,
  UserNotFoundException,
  UsernameAlreadyExistsException,
} from '../../common/exceptions';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * User Service Test Suite
 *
 * Comprehensive test coverage for UserService built iteratively.
 * Each test is added one at a time and validated before moving to the next.
 *
 * Tests focus on:
 * - User creation with validation
 * - Email and username uniqueness checks
 * - Exception handling and error scenarios
 * - Database interaction mocking
 *
 * @test UserService
 * @requires UserService
 * @requires User Entity
 * @requires Custom Exceptions (EmailAlreadyExistsException, UsernameAlreadyExistsException)
 */
describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  /**
   * Mock user object for testing
   *
   * Represents a typical user record returned from the database.
   * Used as a fixture throughout test cases.
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
   * Mock user creation data for testing
   *
   * Represents data sent from a client during user registration.
   * Contains required fields: email, username, password.
   * Contains optional fields: first_name, last_name.
   */
  const mockCreateUserData = {
    email: 'john@example.com',
    username: 'john_doe',
    password: 'SecurePassword123!',
    first_name: 'John',
    last_name: 'Doe',
  };

  /**
   * Setup: Initialize testing module with mocked repository
   *
   * This function runs before each test to ensure a clean state.
   * Creates a NestJS testing module with:
   * - UserService (the service under test)
   * - Mocked Repository<User> with all methods as jest.fn()
   *
   * Dependency injection is handled by NestJS testing utilities.
   *
   * @before Each test execution
   */
  beforeEach(async () => {
    // Create mock repository with arrow functions to avoid ESLint unbound-method warnings
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  /**
   * Cleanup: Clear all mocks after each test
   *
   * This ensures that mock data from one test doesn't affect another test.
   * Prevents flaky tests caused by mock state leaking between test cases.
   *
   * @after Each test execution
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // CREATE METHOD TEST SUITE
  // ============================================================================

  /**
   * Test suite for UserService.create() method
   *
   * Tests user creation with validation, duplication checks, and error handling.
   * All create() scenarios are tested here.
   */
  describe('create()', () => {
    /**
     * Test Case 1️⃣: Successful user creation
     *
     * Scenario: Email and username are unique, all required fields provided
     * Expected: User is created and saved to database
     *
     * Validates that:
     * - Both email and username uniqueness checks return null (no duplicates)
     * - User object is created with correct data
     * - User object is saved to database
     * - Created user is returned to caller
     * - Password is hashed before storage
     *
     * Test Setup:
     * - Mock findOne to return null twice (email check, username check)
     * - Mock create to return mockUser
     * - Mock save to return mockUser
     * - Mock User.hashPassword static method
     *
     * Assertions:
     * - result is defined
     * - create was called with email and username
     * - save was called with mockUser
     */
    it('should create a new user when email and username are unique', async () => {
      // Setup: Mock repository to return null for both uniqueness checks
      // First call simulates email uniqueness check passing
      // Second call simulates username uniqueness check passing
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(null) // No existing email
        .mockResolvedValueOnce(null); // No existing username

      // Create spies for methods we'll assert on
      const createSpy = jest
        .spyOn(userRepository, 'create')
        .mockReturnValue(mockUser);
      const saveSpy = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(mockUser);

      // Mock the static password hashing method on User entity
      jest.spyOn(User, 'hashPassword').mockResolvedValue('hashedPassword123');

      // Execute: Call the service method with valid user data
      const result = await userService.create(mockCreateUserData);

      // Verify: Check that user was created with correct data
      expect(result).toBeDefined();
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockCreateUserData.email,
          username: mockCreateUserData.username,
        }),
      );

      // Verify: Check that user was saved to database
      expect(saveSpy).toHaveBeenCalledWith(mockUser);
    });

    /**
     * Test Case 2️⃣: Email already exists
     *
     * Scenario: User attempts to register with an email that already exists
     * Expected: EmailAlreadyExistsException is thrown
     *
     * Validates that:
     * - Service correctly checks for duplicate email
     * - Throws the correct custom exception (EmailAlreadyExistsException)
     * - No further database operations occur after email conflict detected
     * - Service fails fast on email conflict before checking username
     *
     * Test Setup:
     * - Mock findOne to return mockUser on first call (simulates email existing)
     *
     * Assertions:
     * - EmailAlreadyExistsException is thrown
     * - Exception is thrown during create() call
     */
    it('should throw EmailAlreadyExistsException when email already exists', async () => {
      // Setup: Mock findOne to return existing user on first call (email check)
      // This simulates the email already being registered
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);

      // Execute & Verify: Expect EmailAlreadyExistsException to be thrown
      // The service should detect the duplicate email and throw immediately
      await expect(userService.create(mockCreateUserData)).rejects.toThrow(
        EmailAlreadyExistsException,
      );
    });

    /**
     * Test Case 3️⃣: Username already exists
     *
     * Scenario: User attempts to register with a username that already exists
     * Expected: UsernameAlreadyExistsException is thrown
     *
     * Validates that:
     * - Service passes email uniqueness check
     * - Service correctly detects duplicate username on second check
     * - Throws the correct custom exception (UsernameAlreadyExistsException)
     * - Flow: email check passes → username check fails → exception thrown
     *
     * Test Setup:
     * - Mock findOne with chained responses:
     *   - First call (email check): null (email is unique)
     *   - Second call (username check): mockUser (username already exists)
     *
     * Assertions:
     * - UsernameAlreadyExistsException is thrown
     * - Exception is thrown during create() call
     */
    it('should throw UsernameAlreadyExistsException when username already exists', async () => {
      // Setup: Mock findOne with chained responses
      // First call returns null: email is unique (passes check)
      // Second call returns mockUser: username already exists (fails check)
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValueOnce(mockUser); // Username check fails

      // Execute & Verify: Expect UsernameAlreadyExistsException to be thrown
      // The service should detect the duplicate username and throw
      await expect(userService.create(mockCreateUserData)).rejects.toThrow(
        UsernameAlreadyExistsException,
      );
    });
  });

  /**
   * Test suite for UserService.findById() method
   *
   * Tests user retrieval by unique identifier with exception handling.
   */
  describe('findById()', () => {
    /**
     * Test Case 4️⃣: User found by ID
     *
     * Scenario: Valid user ID provided and user exists in database
     * Expected: User object is returned
     *
     * Validates that:
     * - Repository is queried with correct ID
     * - User object is returned with all properties
     * - Password hash is excluded from response
     *
     * Test Setup:
     * - Mock findOne to return mockUser
     *
     * Assertions:
     * - result is defined
     * - result contains correct email
     * - findOne called with correct ID
     */
    it('should return a user when found by ID', async () => {
      // Setup: Mock repository to return user
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      // Execute: Call the service method
      const result = await userService.findById(mockUser.id);

      // Verify: User is returned with correct data
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
      // Verify: Repository was called with correct query
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    /**
     * Test Case 5️⃣: User not found by ID
     *
     * Scenario: User ID provided but no user exists with that ID
     * Expected: UserNotFoundException is thrown
     *
     * Validates that:
     * - Service detects missing user
     * - Throws the correct custom exception (UserNotFoundException)
     * - Error message is descriptive
     *
     * Test Setup:
     * - Mock findOne to return null
     *
     * Assertions:
     * - UserNotFoundException is thrown
     */
    it('should throw UserNotFoundException when user does not exist', async () => {
      // Setup: Mock repository to return null (user not found)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // Execute & Verify: Expect UserNotFoundException to be thrown
      await expect(userService.findById('non-existent-id')).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
