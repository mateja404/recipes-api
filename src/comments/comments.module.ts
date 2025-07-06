import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Banned, BannedSchema } from 'src/schema/ipban.schema';
import { User, UserSchema } from 'src/schema/user.schema';

@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      JwtModule.register({ secret: process.env.JWT_TOKEN, signOptions: { expiresIn: '3h' } }),
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      MongooseModule.forFeature([{ name: Banned.name, schema: BannedSchema }]),
    ],
  providers: [CommentsService],
  controllers: [CommentsController]
})
export class CommentsModule {}
