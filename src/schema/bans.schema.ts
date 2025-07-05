import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Bans {
  @Prop({ required: true, unique: true })
  adminId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  userId: Types.ObjectId;

  @Prop()
  reason?: string;
}

export type BansDocument = Bans & Document;
export const BansSchema = SchemaFactory.createForClass(Bans);