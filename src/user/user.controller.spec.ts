import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { PrivilageGuard } from 'src/guards/privilage.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';
import { UserService } from './user.service';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { ChangePwDto, ChangeEmailDto } from './dto';

const mockGuard = {
  canActivate: jest.fn(() => true),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserInfo: jest.fn(),
            updateAiSlots: jest.fn(),
            changePassword: jest.fn(),
            forgotPassword: jest.fn(),
            changeUserEmail: jest.fn()
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
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call userService.getUserInfo', async () => {
    const getUserInfoSpy = jest.spyOn(service, 'getUserInfo').mockResolvedValue({ user: { userId: 123 } });
    const mockRequest = { user: { sub: 123 } } as unknown as RequestWithUser;
    const recipes = await controller.getUserInfo(mockRequest);
    expect(getUserInfoSpy).toHaveBeenCalled();
    expect(recipes).toEqual({ user: { userId: 123 } });
  });

  it('should call userService.updateAiSlots', async () => {
    const updateAiSlotsSpy = jest.spyOn(service, 'updateAiSlots').mockResolvedValue({ aiSlots: 123 });
    const mockRequest = { user: { sub: 123 } } as unknown as RequestWithUser;
    const slots = await controller.updateAiSlots(mockRequest);
    expect(updateAiSlotsSpy).toHaveBeenCalled();
    expect(slots).toEqual({ aiSlots: 123 });
  });

  it('should call userService.changePassword', async () => {
    const changePasswordSpy = jest.spyOn(service, 'changePassword').mockResolvedValue({ message: "eee" });
    const mockRequest = { user: { sub: 123 } } as unknown as RequestWithUser;
    const newPassword = 'newStrongPassword123'; 
    const changePwDto = new ChangePwDto();
    changePwDto.newPassword = newPassword;
    const slots = await controller.changePassword(mockRequest, changePwDto);
    expect(changePasswordSpy).toHaveBeenCalled();
    expect(slots).toEqual({ message: "eee" });
  });

  it('should call userService.forgotPassword', async () => {
    const forgotPasswordSpy = jest.spyOn(service, 'forgotPassword').mockResolvedValue({ message: "Reset link has been sent to your email" });
    const mockRequest = { user: { sub: 123 } } as unknown as RequestWithUser;
    const forgotPass = await controller.forgotPassword(mockRequest);
    expect(forgotPasswordSpy).toHaveBeenCalled();
    expect(forgotPass).toEqual({ message: "Reset link has been sent to your email" });
  });

  it('should call userService.changeUserEmail', async () => {
    const changeUserEmailSpy = jest.spyOn(service, 'changeUserEmail').mockResolvedValue({ message: "Email has been successfully changed" });
    const mockRequest = { user: { sub: 123 } } as unknown as RequestWithUser;
    const newEmail = "jocopanter@gmail.com";
    const changeEmailDto = new ChangeEmailDto();
    changeEmailDto.email = newEmail;
    const changeEmail = await controller.changeUserEmail(changeEmailDto, mockRequest);
    expect(changeUserEmailSpy).toHaveBeenCalled();
    expect(changeEmail).toEqual({ message: "Email has been successfully changed" });
  });
});