import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { IPBans, IPBansSchema } from '../schema/ipban.schema';
import { User, UserSchema } from '../schema/user.schema';
import { Recipe, RecipeSchema } from '../schema/recipe.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
      NotificationsModule,
      ConfigModule.forRoot({ isGlobal: true }),
      JwtModule.register({ secret: process.env.JWT_TOKEN, signOptions: { expiresIn: '3h' } }),
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      MongooseModule.forFeature([{ name: IPBans.name, schema: IPBansSchema }]),
      MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }])
    ],
  providers: [CommentsService, NotificationsService],
  controllers: [CommentsController]
})
export class CommentsModule {}
