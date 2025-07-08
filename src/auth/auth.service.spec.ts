import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockImplementation((pass, hashed) => pass === 'test123'),
}));

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mockedToken'),
  verify: jest.fn().mockReturnValue({ userId: '123' }),
  signAsync: jest.fn().mockResolvedValue('123')
};

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const mockModel = {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  describe('register', () => {
    it('should throw conflictexception if user already exist', async () => {
      const userId = new Types.ObjectId();
      const regularUser = {
        _id: userId,
        username: 'matke',
        email: 'matke@gmail.com',
        password: '123123',
        role: 'user',
        banned: false,
        aiSlots: 100,
        findOne: jest.fn().mockResolvedValue(true),
      }

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(regularUser)
      } as any);

      await expect(service.register('matke', 'matke@gmail.com', '123')).rejects.toThrow(ConflictException);
    });

    it('should create new user', async () =>  {
      const username = 'matke';
      const email = 'matkee@gmail.com';
      const password = 'test123';

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      jest.spyOn(userModel, 'create').mockResolvedValue({
        _id: new Types.ObjectId(),
        username: username,
        email: email,
        password: password,
        role: 'user',
        banned: false,
        aiSlots: 100
      } as any);

      const result = await service.register(username, email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toEqual({ message: "You're successfully registered!" });
    });
  });

  describe('login', () => {
    it('should throw notfoundexception if user is not in database', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      await expect(service.login('matke@email.com', '123')).rejects.toThrow(NotFoundException);
    });

    it('should successfully login user', async () => {
      const username = 'matke';
      const email = 'matkee@gmail.com';
      const password = 'test123';

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          username: username,
          email: email,
          password: password,
          role: 'user',
          banned: false,
          aiSlots: 100
        })
      } as any);

      const result = await service.login(email, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, password);
      expect(userModel.findOne).toHaveBeenCalled();
      expect(mockJwtService.signAsync).toHaveBeenCalled();
      expect(result).toEqual({ message: "You're logged in!", token: "123", banned: false });
    });
  });
});