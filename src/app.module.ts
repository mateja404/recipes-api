import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { RecipesModule } from './recipes/recipes.module';
import { AdminService } from './admin/admin.service';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [AuthModule, MongooseModule.forRoot('mongodb+srv://kididrtina:Vodopad123@recipes-api.jo7bzor.mongodb.net/?retryWrites=true&w=majority&appName=recipes-api'), ThrottlerModule.forRoot({ throttlers: [ { ttl: 60000, limit: 5, }, ], }), RecipesModule, AdminModule, UserModule, CommentsModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}