import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument, User } from 'src/schema/user.schema';
import { BannedDocument, Banned } from 'src/schema/ipban.schema';

@Injectable()
export class AdminService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, @InjectModel(Banned.name) private bannedModel: Model<BannedDocument>) {}

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
