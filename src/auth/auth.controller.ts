import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BanIpDto, LoginDto, RegisterDto } from './dto';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from './roles.guard';
import { IpBanGuard } from 'src/guards/ip.guard';

export enum Role {
  User = 'user',
  Admin = 'admin',
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(IpBanGuard)
    @Post("/register")
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto.username, dto.email, dto.password);
    }

    @UseGuards(IpBanGuard)
    @Post("/login")
    async login(@Body() dto: LoginDto) {
        console.log(dto)
        return this.authService.login(dto.email, dto.password);
    }
}