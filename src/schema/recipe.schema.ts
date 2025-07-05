import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema({ timestamps: true })
export class Recipe {

  @Prop({ required: true })
  userId: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop({ required: true, unique: true })
  recipeText: string;

  @Prop({ required: true })
  author: string;

  @Prop({ type: [String], default: [] })
  comments: string[]

  @Prop({ default: 0 })
  likes: number
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);