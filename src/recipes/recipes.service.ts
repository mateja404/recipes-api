import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Recipe, RecipeDocument } from 'src/schema/recipe.schema';
import { User, UserDocument } from 'src/schema/user.schema';

@Injectable()
export class RecipesService {
    constructor(@InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>, @InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async getAllRecipes(): Promise<{ recipes }> {
        const recipes = await this.recipeModel.find({});

        return { recipes: recipes };
    }

    async deleteRecipeById(userId: Types.ObjectId, recipeId: Types.ObjectId): Promise<any> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const recipe = await this.recipeModel.findById(recipeId);
        if (!recipe) {
            throw new NotFoundException("Recipe not found");
        }

        if (user.role !== 'admin' && !recipe.userId.equals(userId)) {
            throw new ForbiddenException("You are not allowed to delete this recipe");
        }

        await recipe.deleteOne();

        return { message: "Recipe successfully deleted" };
    }

    async createRecipe(userId: Types.ObjectId, title: string, recipeText: string): Promise<{ message }> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const existingRecipe = await this.recipeModel.findOne({ title: title });
        if (existingRecipe) {
            throw new ConflictException("Recipe with this title already exist");
        }

        const recipe = await this.recipeModel.create({
            userId: userId,
            title: title,
            recipeText: recipeText,
            author: user.username,
        });

        return { message: "Recipe successfully created" };
    }

    async patchRecipe(id: Types.ObjectId, userId?: Types.ObjectId, title?: string, recipeText?: string): Promise<{ message }> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const updateFields: { title?: string; recipeText?: string } = {};
        if (title !== undefined) {
            updateFields.title = title;
        }
        if (recipeText !== undefined) {
            updateFields.recipeText = recipeText;
        }

        if (Object.keys(updateFields).length === 0) {
            const existingRecipe = await this.recipeModel.findById(id).exec();
            if (!existingRecipe) {
                throw new NotFoundException("Recipe not found.");
            }
            return { message: "There is nothing to change" };
        }

        const updatedRecipe = await this.recipeModel.findOneAndUpdate( { _id: id }, updateFields).exec();
        if (!updatedRecipe) {
            throw new NotFoundException("Recipe not found");
        }

        return { message: "Recipe edited successfully" };
    }
}