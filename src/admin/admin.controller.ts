import { Body, Controller, Get, Post, UseGuards, Patch, Param, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles, Role } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';
import { Types } from 'mongoose';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { BanUserDto, BanIpDto } from './dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @UseGuards(AuthGuard, RolesGuard, IpBanGuard)
    @Roles(Role.Admin)
    @Get('/getusers')
    getUsers() {
        return this.adminService.getUsers();
    }

    @UseGuards(AuthGuard, RolesGuard, IpBanGuard)
    @Roles(Role.Admin)
    @Post('/banip/:id')
    banIp(@Param('id') ipToBan: string, @Body() dto: BanUserDto) {
        return this.adminService.banIp(ipToBan, dto.reason);
    }

    @UseGuards(AuthGuard, RolesGuard, IpBanGuard)
    @Roles(Role.Admin)
    @Patch('/banuser/:id')
    banUser(@Param('id') bannedUserId: Types.ObjectId, @Req() req: RequestWithUser, @Body() dto: BanUserDto) {
        const adminId = req.user.sub
        return this.adminService.banUser(bannedUserId, adminId, dto.reason);
    }

    @UseGuards(AuthGuard, RolesGuard, IpBanGuard)
    @Roles(Role.Admin)
    @Patch('/unbanuser/:id')
    unbanUser(@Param('id') bannedUserId: Types.ObjectId) {
        return this.adminService.unbanUser(bannedUserId);
    }
}