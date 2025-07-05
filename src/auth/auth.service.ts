import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { Banned, BannedDocument } from 'src/schema/ipban.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwtService: JwtService, @InjectModel(Banned.name) private bannedModel: Model<BannedDocument>) {}

  async register(username: string, email: string, password: string): Promise<{ message }> {
    const existingUser = await this.userModel.findOne({ email: email });
    console.log(username, email, password)
    
    if (existingUser) {
        throw new ConflictException("User already exist");
    }
    const password_hash = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
        username: username,
        email: email,
        password: password_hash,
        role: "user",
        banned: false
    });
    return { message: "You're successfully registered!" }
  }

  async login(email: string, password: string): Promise<{ message, token, banned }> {
    const existingUser = await this.userModel.findOne({ email: email });
    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    const matchedUser = await bcrypt.compare(password, existingUser.password);
    if (!matchedUser) {
      throw new UnauthorizedException("Wrong password");
    }
    const payload = { sub: existingUser._id, username: existingUser.username, email: existingUser.email, role: existingUser.role };
    const token = await this.jwtService.signAsync(payload);

    return { message: "You're logged in!", token: token, banned: existingUser.banned };
  }

  async getusers(): Promise<{ users }> {
    const users = await this.userModel.find();
    return { users };
  }

  async banIp(userId: Types.ObjectId, ip: string, reason: string): Promise<{ message }> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      return new NotFoundException("User not found");
    }

    user.banned = true;
    const newban = await this.bannedModel.create({
      ip: ip,
      reason: reason
    });
    user.save();

    return { message: "Successfully" };
  }
}