import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { Bans, BansDocument } from 'src/schema/bans.schema';
import { IPBans, IPBansDocument } from 'src/schema/ipban.schema';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let userModel: Model<UserDocument>;
  let bansModel: Model<BansDocument>;
  let ipBansModel: Model<IPBansDocument>;

  beforeEach(async () => {
    const mockModel = {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Bans.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(IPBans.name),
          useValue: mockModel,
        }
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    bansModel = module.get<Model<BansDocument>>(getModelToken(Bans.name));
    ipBansModel = module.get<Model<IPBansDocument>>(getModelToken(IPBans.name));
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      jest.spyOn(userModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(["user1", "user2"])
      } as any);
      const result = await service.getUsers();

      expect(userModel.find).toHaveBeenCalled();
      expect(result).toEqual({ users: ["user1", "user2"] });
    });
  });

  describe('banIp', () => {
    it('should throw conflictexception if ban already exist', async () => {
      const ip = '127.0.0.1';
      jest.spyOn(ipBansModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ip: ip,
          reason: 'no reason'
        })
      } as any);
      await expect(service.banIp(ip, 'no reason')).rejects.toThrow(ConflictException);
    });

    it('should ban ip', async () => {
      const ip = '127.0.0.1';

      jest.spyOn(ipBansModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      jest.spyOn(ipBansModel, 'create').mockResolvedValue({
        ip: ip,
        reason: 'No reason?'
      } as any);

      const result = await service.banIp(ip, 'No reason?');

      expect(ipBansModel.create).toHaveBeenCalled();
      expect(result).toEqual({ message: "IP has been banned successfully" });
    });
  });

  describe('banUser', () => {
    it('should throw forbiddenexception if user is admin', async () => {
      const userId = new Types.ObjectId();
      const adminUser = {
        _id: userId,
        email: 'admin@example.com',
        password: 'secret',
        role: 'admin',
        banned: false,
        aiSlots: 100
      };

      jest.spyOn(userModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(adminUser)
      } as any);

      await expect(service.banUser(userId, userId, 'No')).rejects.toThrow(ForbiddenException);
    });

    it('should throw notfoundexception if admin is not found in database', async () => {
      const userId = new Types.ObjectId();
      const adminId = new Types.ObjectId();
      const userToBan = {
        _id: userId,
        email: 'user@example.com',
        password: 'secret',
        role: 'user',
        banned: false,
        aiSlots: 100
      };

      jest.spyOn(userModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(userToBan)
      } as any);

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      await expect(service.banUser(userId, adminId, 'No')).rejects.toThrow(NotFoundException);
    });

    it('should ban user', async () => {
      const userId = new Types.ObjectId();
      const adminId = new Types.ObjectId();
      const userToBan = {
        _id: userId,
        email: 'user@example.com',
        password: 'secret',
        role: 'user',
        banned: false,
        aiSlots: 100
      };
      const admin = {
        _id: adminId,
        role: 'admin'
      };

      jest.spyOn(userModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(userToBan)
      } as any);

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(admin)
      } as any);

      const result = await service.banUser(userId, adminId, 'No reson');

      expect(userModel.findOneAndUpdate).toHaveBeenCalled();
      expect(userModel.findById).toHaveBeenCalled();
      expect(result).toEqual({ message: "User has been successfully banned" });
    });
  });

  describe('unbanUser', () => {
    it('should throw notfoundexcept if user is not found', async () => {
      const bannedUserId = new Types.ObjectId();
      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      await expect(service.unbanUser(bannedUserId)).rejects.toThrow(NotFoundException);
    });

    it('should throw notfoundexception if user is not banned', async () => {
      const bannedUserId = new Types.ObjectId();
      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      jest.spyOn(bansModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      await expect(service.unbanUser(bannedUserId)).rejects.toThrow(NotFoundException);
    });

    it('should unban user', async () => {
      const bannedUserId = new Types.ObjectId();
      const bannedUser = {
        _id: bannedUserId,
        banned: true,
        save: jest.fn().mockResolvedValue(true),
      };
      const bannedDoc = {
        _id: new Types.ObjectId(),
        userId: bannedUserId,
        reason: "spam"
      };

      jest.spyOn(bansModel, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(bannedDoc)
      } as any);

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(bannedUser)
      } as any);

      const result = await service.unbanUser(bannedUserId);

      expect(bannedUser.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User has been successfully unbanned' });
    });
  });
});