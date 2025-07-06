import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user.schema';
import { ConfigModule } from '@nestjs/config';
import { Banned, BannedSchema } from '../schema/ipban.schema';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ secret: process.env.JWT_TOKEN, signOptions: { expiresIn: '3h' } }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Banned.name, schema: BannedSchema }]),
    MailerModule.forRoot({
      transport: {
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
          user: "murkoffcorp11@gmail.com",
          pass: "bhbq gwwi ghuf rydu",
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: '"no-reply" <no-reply@example.com>',
      },
    }),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}