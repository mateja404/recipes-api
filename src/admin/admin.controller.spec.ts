import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';
import { PrivilageGuard } from 'src/guards/privilage.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Types } from 'mongoose';
import { BanIpDto, BanUserDto } from './dto';

const mockGuard = {
  canActivate: jest.fn(() => true),
};

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getUsers: jest.fn(),
            banIp: jest.fn(),
            banUser: jest.fn(),
            unbanUser: jest.fn()
          },
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue(mockGuard)
    .overrideGuard(IpBanGuard)
    .useValue(mockGuard)
    .overrideGuard(PrivilageGuard)
    .useValue(mockGuard)
    .overrideGuard(RolesGuard)
    .useValue(mockGuard)
    .compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call adminServices.getUsers', async () => {
    const getUsersSpy = jest.spyOn(service, 'getUsers').mockResolvedValue({ users: ["user1", "user2"] });
    const result = await controller.getUsers();

    expect(getUsersSpy).toHaveBeenCalled();
    expect(result).toEqual({ users: ["user1", "user2"] });
  });

  it('should call adminService.banIp', async () => {
    const banIpSpy = jest.spyOn(service, 'banIp').mockResolvedValue({ message: "IP has been banned successfully" });
    const id = new Types.ObjectId();
    const banIpDto = new BanIpDto();
    banIpDto.reason = 'No reason';

    const result = await controller.banIp(id, banIpDto);

    expect(banIpSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: "IP has been banned successfully" });
  });

  it('should call adminService.banUser', async () => {
    const banUserSpy = jest.spyOn(service, 'banUser').mockResolvedValue({ message: "User has been successfully banned" });
    const mockRequest = { user: { sub: new Types.ObjectId() } } as unknown as RequestWithUser;
    const id = new Types.ObjectId();
    const banUserDto = new BanUserDto();

    const result = await controller.banUser(id, mockRequest, banUserDto);

    expect(banUserSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: "User has been successfully banned" });
  });

  it('should call adminService.unbanUser', async () => {
    const unbanUserSpy = jest.spyOn(service, 'unbanUser').mockResolvedValue({ message: "User has been successfully unbanned" });
    const id = new Types.ObjectId();

    const result = await controller.unbanUser(id);

    expect(unbanUserSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: "User has been successfully unbanned" });
  });
});