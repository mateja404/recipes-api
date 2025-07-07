import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';

// Mocks
const userId = new Types.ObjectId();
const mockUser = {
  _id: userId,
  email: 'test@example.com',
  password: 'hashedpassword',
  aiSlots: 5,
  save: jest.fn().mockResolvedValue(true),
};

// Kreiramo mock za mongoose model
const mockUserModel = {
  findById: jest.fn().mockReturnValue({
    exec: jest.fn()
  })
};

const mockMailService = {
  sendMail: jest.fn().mockResolvedValue(true),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset mock-a za svaki test
    mockUserModel.findById.mockReturnValue({
      exec: jest.fn()
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { 
          provide: getModelToken(User.name), 
          useValue: mockUserModel 
        },
        { 
          provide: MailerService, 
          useValue: mockMailService 
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('changeUserEmail', () => {
    it('should change the user email and save', async () => {
      const userWithSave = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(true)
      };
      mockUserModel.findById().exec.mockResolvedValueOnce(userWithSave);

      const result = await service.changeUserEmail(userId, 'new@example.com');
      
      expect(userWithSave.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Email has been successfully changed' });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById().exec.mockResolvedValueOnce(null);
      
      await expect(service.changeUserEmail(userId, 'new@example.com'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('forgotPassword', () => {
    it('should send a reset link email', async () => {
      mockUserModel.findById().exec.mockResolvedValueOnce(mockUser);
      
      const result = await service.forgotPassword(userId);
      
      expect(mockMailService.sendMail).toHaveBeenCalledWith({
        from: 'Recipes API <recipeapi@murkoff.com>',
        to: mockUser.email,
        subject: 'Urgent! Recipes API forgot password',
        text: expect.stringContaining('Forgot your password?')
      });
      expect(result).toEqual({ message: 'Reset link has been sent to your email' });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById().exec.mockResolvedValueOnce(null);
      
      await expect(service.forgotPassword(userId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change the password if not matching', async () => {
      const userWithSave = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(true)
      };
      mockUserModel.findById().exec.mockResolvedValueOnce(userWithSave);

      const result = await service.changePassword(userId, 'newpassword');
      
      expect(userWithSave.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Password has been changed successfully' });
    });

    it('should throw ConflictException if password is already in use', async () => {
      const existingPassword = 'samepw';
      mockUserModel.findById().exec.mockResolvedValueOnce({ 
        ...mockUser, 
        password: existingPassword 
      });

      await expect(service.changePassword(userId, existingPassword))
        .rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById().exec.mockResolvedValueOnce(null);
      
      await expect(service.changePassword(userId, 'newpw'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserInfo', () => {
    it('should return user info', async () => {
      mockUserModel.findById.mockResolvedValueOnce(mockUser);
      
      const result = await service.getUserInfo(userId);
      
      expect(result).toEqual({ user: mockUser });
    });

    it('should return null if user not found', async () => {
      mockUserModel.findById.mockResolvedValueOnce(null);
      
      const result = await service.getUserInfo(userId);
      
      expect(result).toEqual({ user: null });
    });
  });

  describe('updateAiSlots', () => {
    it('should decrement aiSlots and save', async () => {
      const userWithSlots = {
        ...mockUser,
        aiSlots: 3,
        save: jest.fn().mockResolvedValue(true)
      };
      mockUserModel.findById.mockResolvedValueOnce(userWithSlots);

      const result = await service.updateAiSlots(userId);
      
      expect(userWithSlots.aiSlots).toBe(2);
      expect(userWithSlots.save).toHaveBeenCalled();
      expect(result).toEqual({ aiSlots: 2 });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockResolvedValueOnce(null);
      
      await expect(service.updateAiSlots(userId))
        .rejects.toThrow(NotFoundException);
    });
  });
});