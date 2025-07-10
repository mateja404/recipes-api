import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument, User } from '../schema/user.schema';
import { Bans, BansDocument } from '../schema/bans.schema';
import { IPBans, IPBansDocument } from '../schema/ipban.schema';

@Injectable()
export class AdminService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, @InjectModel(Bans.name) private bansModel: Model<BansDocument>, @InjectModel(IPBans.name) private bannedModel: Model<IPBansDocument>) {}
    
    async getUsers(): Promise<{ users }> {
        const users = await this.userModel.find().exec();
        return { users };
    }

    async banIp(ipToBan: string, reason: string): Promise<{ message }> {
        const existingBan = await this.bannedModel.findOne({ ip: ipToBan }).exec();
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
        const bannedUser = await this.userModel.findOneAndUpdate({ _id: id }, { $set: { banned: true } }).exec();
        if (bannedUser?.role == 'admin') {
            throw new ForbiddenException("You can't ban admins!");
        }
        if (!bannedUser) {
            throw new NotFoundException("User not found");
        }

        const admin = await this.userModel.findById(adminId).exec();
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
        const bannedUser = await this.userModel.findById(bannedUserId).exec();
        if (!bannedUser) {
            throw new NotFoundException("User not found");
        }

        const bannedDoc = await this.bansModel.findOneAndDelete({ userId: bannedUserId }).exec();
        if (!bannedDoc) {
            throw new NotFoundException("User is not banned");
        }

        bannedUser.banned = false;
        await bannedUser.save();

        return { message: "User has been successfully unbanned" };
    }
}