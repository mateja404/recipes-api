import { IsString, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    comment: string;
}