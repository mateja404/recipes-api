import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument, User } from 'src/schema/user.schema';
import { Bans, BansDocument } from 'src/schema/bans.schema';
import { IPBans, IPBansDocument } from 'src/schema/ipban.schema';

@Injectable()
export class AdminService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, @InjectModel(Bans.name) private bansModel: Model<BansDocument>, @InjectModel(IPBans.name) private bannedModel: Model<IPBansDocument>) {}

    async getusers(): Promise<{ users }> {
        const users = await this.userModel.find();
        return { users };
    }

    async banIp(ipToBan: Types.ObjectId, reason: string): Promise<{ message }> {
        const existingBan = await this.bannedModel.findOne({ ip: ipToBan });
        if (existingBan) {
            throw new ConflictException("IP is already banned");
        }

        const ipBan = await this.bannedModel.create({
            ip: ipToBan,
            reason: reason
        });
        return { message: "IP has been banned successfully" };
    }

    async banUser(id, adminId, reason): Promise<{ message }> {
        const bannedUser = await this.userModel.findOneAndUpdate({ _id: id }, { $set: { banned: true } });
        if (bannedUser?.role == 'admin') {
            throw new ForbiddenException("You can't ban admins!");
        }
        if (!bannedUser) {
            throw new NotFoundException("User not found");
        }

        const admin = await this.userModel.findById(adminId);
        if (!admin) {
            throw new NotFoundException("Admin not found");
        }

        const ban = await this.bansModel.create({
            adminId: adminId,
            userId: id,
            reason: reason
        });

        return { message: "User has been successfully banned" };
    }

    async unbanUser(bannedUserId: Types.ObjectId): Promise<{ message }> {
        const bannedUser = await this.userModel.findById(bannedUserId);
        if (!bannedUser) {
            throw new NotFoundException("User not found");
        }

        const bannedDoc = await this.bansModel.findOneAndDelete({ userId: bannedUserId });
        if (!bannedDoc) {
            throw new NotFoundException("User is not banned");
        }

        bannedUser.banned = false;
        await bannedUser.save();

        return { message: "User has been successfully unbanned" };
    }
}