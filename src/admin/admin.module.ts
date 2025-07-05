import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user.schema';
import { Banned, BannedSchema } from '../schema/ipban.schema';
import { AdminService } from './admin.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Banned.name, schema: BannedSchema }
    ]),
    JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: "3h" } })
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}