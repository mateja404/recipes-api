import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { BanIpDto } from 'src/auth/dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles, Role } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @UseGuards(AuthGuard, RolesGuard, IpBanGuard)
    @Roles(Role.Admin)
    @Get('profile')
    getUsers() {
        return this.adminService.getusers();
    }

    @UseGuards(AuthGuard, RolesGuard, IpBanGuard)
    @Roles(Role.Admin)
    @Post('banip')
    banIp(@Body() dto: BanIpDto) {
        return this.adminService.banIp(dto.userId, dto.ip, dto.reason);
    }
}