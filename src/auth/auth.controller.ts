import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { IpBanGuard } from '../guards/ip.guard';

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
        return this.authService.login(dto.email, dto.password);
    }
}