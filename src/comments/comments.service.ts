import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Recipe, RecipeDocument } from '../schema/recipe.schema';
import { User, UserDocument } from '../schema/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>, private readonly notificationsService: NotificationsService) {}

    async createComment(id: Types.ObjectId, posterId: Types.ObjectId, comment: string) {
        const recipe = await this.recipeModel.findByIdAndUpdate(id,{ $push: { comments: comment } },{ new: true }).exec();
        if (!recipe) {
            throw new NotFoundException("Recipe not found");
        }

        const poster = await this.userModel.findById(posterId).exec();
        if (!poster) {
            throw new NotFoundException("User not found");
        }
        const message = `You got new notification from ${poster.username}!`;

        this.notificationsService.sendToUser(String(recipe.userId), message);

        return { message: "Comment has been successfully created" };
    }
}