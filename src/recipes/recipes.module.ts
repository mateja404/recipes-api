import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';
import { Recipe, RecipeSchema } from 'src/schema/recipe.schema';
import { JwtModule } from '@nestjs/jwt';
import { BannedSchema, Banned } from 'src/schema/ipban.schema';

@Module({
  imports: [JwtModule.register({ secret: "superscarysceletons123421scarry", signOptions: { expiresIn: "3h" } }), MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]), MongooseModule.forFeature([{ name: Banned.name, schema: BannedSchema }])],
  controllers: [RecipesController],
  providers: [RecipesService]
})
export class RecipesModule {}