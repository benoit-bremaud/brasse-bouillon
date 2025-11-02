import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * User Service Test Suite
 *
 * Tests are built iteratively, one test at a time.
 * Each test is validated before moving to the next.
 *
 * @test UserService
 */
describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  /**
   * Mock user object for testing
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
   * Mock user creation data
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
   */
  beforeEach(async () => {
    // Create mock repository with arrow functions
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
   * Cleanup: Clear mocks after each test
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // TEST 1️⃣ : Create User Successfully
  // ============================================================================

  /**
   * Test Case: Successful user creation
   *
   * Scenario: Email and username are unique, all required fields provided
   * Expected: User is created and saved to database
   *
   * Validates that:
   * - Both email and username uniqueness checks return null (no duplicates)
   * - User object is created with correct data
   * - User object is saved to database
   * - Created user is returned to caller
   */
  describe('create()', () => {
    it('should create a new user when email and username are unique', async () => {
      // Setup: Create spies for methods BEFORE using them
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(null) // No existing email
        .mockResolvedValueOnce(null); // No existing username
      const createSpy = jest
        .spyOn(userRepository, 'create')
        .mockReturnValue(mockUser);
      const saveSpy = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(mockUser);

      // Mock the static password hashing method
      jest.spyOn(User, 'hashPassword').mockResolvedValue('hashedPassword123');

      // Execute: Call the service method
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
  });
});
