import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, User } from '../schema/user.schema';
import { Types } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private readonly mailService: MailerService) {}

  async changeUserEmail(userId: Types.ObjectId, email: string): Promise<{ message }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.email = email;
    await user.save();
    return { message: "Email has been successfully changed" };
  }

  async forgotPassword(userId: Types.ObjectId): Promise<{ message }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const linkId = uuidv4();
    const message = `Forgot your password? \nReset it in in provided link http://localhost:3000/forgotpassword/reset/${linkId} \nIf you didn't forget your password, please ignore this email!`;

    this.mailService.sendMail({
      from: 'Recipes API <recipeapi@murkoff.com>',
      to: user.email,
      subject: `Urgent! Recipes API forgot password`,
      text: message,
    });
    return { message: "Reset link has been sent to your email" };
  }

  async changePassword(userId: Types.ObjectId, newPw: string): Promise<{ message }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const existingPw = user.password;

    const matchingPw = existingPw == newPw;
    if (matchingPw) {
      throw new ConflictException("Password is already in use");
    }

    user.password = newPw;
    await user.save();
    return { message: "Password has been changed successfully" };
  }

  async getUserInfo(userId: Types.ObjectId): Promise<{ user }> {
    const user = await this.userModel.findById(userId);

    return { user };
  }
}