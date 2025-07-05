import { Types } from "mongoose";
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRecipeDto {
    @IsNotEmpty()
    userId: Types.ObjectId;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    recipeText: string;
}

export class DeleteRecipeDto {
    @IsNotEmpty()
    userId: Types.ObjectId;

    @IsNotEmpty()
    recipeId: Types.ObjectId;
}

export class PatchRecipeDto {
    @IsNotEmpty()
    userId?: Types.ObjectId;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    recipeText?: string;

    @IsOptional()
    @IsString()
    author?: string;
}