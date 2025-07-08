import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Types } from "mongoose";
import { LoginDto, RegisterDto } from './dto';
import { IpBanGuard } from 'src/guards/ip.guard';

const mockGuard = {
  canActivate: jest.fn(() => true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn()
          },
        },
      ],
    })
    .overrideGuard(IpBanGuard)
    .useValue(mockGuard)
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.register', async () => {
    const registerSpy = jest.spyOn(service, 'register').mockResolvedValue({ message: "You're successfully registered!" });
    const registerDto = new RegisterDto;
    registerDto.username = 'matke';
    registerDto.email = 'matke@gmail.com';
    registerDto.password = 'matke123';
    const result = await controller.register(registerDto);

    expect(registerSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: "You're successfully registered!" });
  });

  it('should call authService.login', async () => {
    const token = new Types.ObjectId();
    const loginSpy = jest.spyOn(service, 'login').mockResolvedValue({ message: "You're logged in!", token: token, banned: false });
    const loginDto = new LoginDto;
    loginDto.email = 'matke@gmail.com';
    loginDto.password = 'matke123';
    const result = await controller.login(loginDto);

    expect(loginSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: "You're logged in!", token: token, banned: false });
  });
});