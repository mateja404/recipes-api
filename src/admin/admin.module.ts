import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user.schema';
import { IPBans, IPBansSchema } from '../schema/ipban.schema';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';
import { Bans, BansSchema } from '../schema/bans.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: IPBans.name, schema: IPBansSchema },
      { name: Bans.name, schema: BansSchema }
    ]),
    JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: "3h" } })
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}