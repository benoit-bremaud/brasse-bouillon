/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { UserController } from './user.controller';
import { UserRole } from '../../common/enums/role.enum';
import { UserService } from '../services/user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let configService: ConfigService;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
    username: 'john_doe',
    password_hash: 'hashedPassword123',
    first_name: 'John',
    last_name: 'Doe',
    role: UserRole.USER,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
            updateUserRole: jest.fn(),
            delete: jest.fn(),
            createAdmin: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers() - GET /users', () => {
    it('should return all users', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockUser]);

      const result = await controller.getAllUsers();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockUser.id);
    });
  });

  describe('findById() - GET /users/:id', () => {
    it('should return a user by ID', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);

      const result = await controller.findById(mockUser.id);
      expect(service.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result.id).toEqual(mockUser.id);
    });
  });

  describe('update() - PUT /users/:id', () => {
    it('should update user and return the updated user', async () => {
      const updateDto: UpdateUserDto = { first_name: 'Jane' };
      const updatedUser = { ...mockUser, first_name: 'Jane' } as User;

      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(result.first_name).toBe('Jane');
    });
  });

  describe('delete() - DELETE /users/:id', () => {
    it('should delete user by id and return a success message', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const result = await controller.delete(mockUser.id);

      expect(service.delete).toHaveBeenCalledWith(mockUser.id);
      expect(result.message).toBe('User deleted successfully');
    });
  });

  describe('seedAdmin() - POST /users/dev/seed-admin', () => {
    it('should create a genesis admin', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'SEED_ENDPOINTS_ENABLED') return 'true';
        return undefined;
      });

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      const adminMock = { ...mockUser, role: UserRole.ADMIN } as User;
      jest.spyOn(service, 'createAdmin').mockResolvedValue(adminMock);

      const result = await controller.seedAdmin();
      expect(service.createAdmin).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('seedModerator() - POST /users/dev/seed-moderator', () => {
    it('should create moderator and update role to MODERATOR', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'SEED_ENDPOINTS_ENABLED') return 'true';
        return undefined;
      });

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);

      const createdModerator = {
        ...mockUser,
        id: '550e8400-e29b-41d4-a716-446655440123',
        email: 'moderator@example.com',
        username: 'moderator',
        role: UserRole.ADMIN,
      } as User;

      const updatedModerator = {
        ...createdModerator,
        role: UserRole.MODERATOR,
      } as User;

      jest.spyOn(service, 'createAdmin').mockResolvedValue(createdModerator);
      jest.spyOn(service, 'updateUserRole').mockResolvedValue(updatedModerator);

      const result = await controller.seedModerator();

      expect(service.createAdmin).toHaveBeenCalledWith(
        'moderator@example.com',
        'moderator',
        'ModeratorPassword123!',
        'Moderator',
        'User',
      );
      expect(service.updateUserRole).toHaveBeenCalledWith(
        createdModerator.id,
        UserRole.MODERATOR,
      );
      expect(result.role).toBe(UserRole.MODERATOR);
    });
  });
});
