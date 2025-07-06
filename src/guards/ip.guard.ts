import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IPBans } from "src/schema/ipban.schema";

@Injectable()
export class IpBanGuard implements CanActivate {
    constructor(@InjectModel(IPBans.name) private bannedModel: Model<any>) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        let ip = request.headers['x-forwarded-for'] 
            ? (request.headers['x-forwarded-for'] as string).split(',')[0].trim()
            : request.ip;

        if (ip === '::1') {
            ip = '127.0.0.1';
        }

        const banned = await this.bannedModel.findOne({ ip });

        if (banned) {
            throw new ForbiddenException('Your IP is banned.');
        }

        return true;
    }
}