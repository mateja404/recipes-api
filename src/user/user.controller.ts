import { Controller, Body, Param, Req, Post, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guard';
import { IpBanGuard } from '../guards/ip.guard';
import { PrivilageGuard } from '../guards/privilage.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ChangeEmailDto, ChangePwDto } from './dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard, IpBanGuard)
  @Patch('/changeemail')
  changeEmail(@Body() dto: ChangeEmailDto, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.userService.changeUserEmail(new Types.ObjectId(userId), dto.email);
  }

  @UseGuards(AuthGuard, IpBanGuard)
  @Patch('/forgotpassword')
  forgotPass(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.userService.forgotPassword(new Types.ObjectId(userId));
  }

  @UseGuards(AuthGuard, IpBanGuard)
  @Patch('/changepassword')
  changePW(@Req() req: RequestWithUser, dto: ChangePwDto) {
    const userId = req.user.sub;
    return this.userService.changePassword(new Types.ObjectId(userId), dto.newPassword);
  }
}