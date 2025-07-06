import { IsString, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class CreateCommentDto {
    @IsNotEmpty()
    recipeId: Types.ObjectId;
}