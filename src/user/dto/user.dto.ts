import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ChangePwDto {
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}