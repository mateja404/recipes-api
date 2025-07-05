import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { Types } from 'mongoose';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class BanIpDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  ip: string;

  @IsNotEmpty()
  @IsString()
  reason: string
}