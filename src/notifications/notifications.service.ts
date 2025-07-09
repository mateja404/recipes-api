import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private readonly gateway: NotificationsGateway) {}

    async sendToUser(userId: string, message: string) {
        this.gateway.sendNotificationToUser(userId, message);
    }
}