import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user.schema';
import { IPBansSchema, IPBans } from '../schema/ipban.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: "3h" } }), MongooseModule.forFeature([{ name: IPBans.name, schema: IPBansSchema }])],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}