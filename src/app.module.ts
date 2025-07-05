import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { RecipesModule } from './recipes/recipes.module';

@Module({
  imports: [AuthModule, MongooseModule.forRoot('mongodb://localhost:27017/recipes-api'), ThrottlerModule.forRoot({ throttlers: [ { ttl: 60000, limit: 5, }, ], }), RecipesModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}