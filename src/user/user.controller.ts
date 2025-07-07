import { Controller, Body, Param, Req, Post, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guard';
import { IpBanGuard } from '../guards/ip.guard';
import { ChangeEmailDto, ChangePwDto } from './dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard, IpBanGuard)
  @Patch('/changeemail')
  changeUserEmail(@Body() dto: ChangeEmailDto, @Req() req: RequestWithUser): Promise<{ message }> {
    const userId = req.user.sub;
    return this.userService.changeUserEmail(new Types.ObjectId(userId), dto.email);
  }

  @UseGuards(AuthGuard, IpBanGuard)
  @Patch('/forgotpassword')
  forgotPassword(@Req() req: RequestWithUser): Promise<{ message }> {
    const userId = req.user.sub;
    return this.userService.forgotPassword(new Types.ObjectId(userId));
  }

  @UseGuards(AuthGuard, IpBanGuard)
  @Patch('/changepassword')
  changePassword(@Req() req: RequestWithUser, dto: ChangePwDto): Promise<{ message }> {
    const userId = req.user.sub;
    return this.userService.changePassword(new Types.ObjectId(userId), dto.newPassword);
  }

  @UseGuards(AuthGuard, IpBanGuard)
  @Get('/getuserinfo')
  getUserInfo(@Req() req: RequestWithUser): Promise<{ user }> {
    const userId = req.user.sub;
    return this.userService.getUserInfo(new Types.ObjectId(userId));
  }

  @UseGuards(AuthGuard, IpBanGuard)
  @Patch('/updateaislots')
  updateAiSlots(@Req() req: RequestWithUser): Promise<{ aiSlots: number }> {
    const userId = req.user.sub;
    return this.userService.updateAiSlots(new Types.ObjectId(userId));
  }
}