import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user.schema';
import { Recipe, RecipeSchema } from '../schema/recipe.schema';
import { JwtModule } from '@nestjs/jwt';
import { IPBansSchema, IPBans } from '../schema/ipban.schema';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: "3h" } }), MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]), MongooseModule.forFeature([{ name: IPBans.name, schema: IPBansSchema }])],
  controllers: [RecipesController],
  providers: [RecipesService]
})
export class RecipesModule {}