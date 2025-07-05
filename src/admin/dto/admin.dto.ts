import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { Types } from 'mongoose';

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