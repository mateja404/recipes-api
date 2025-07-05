import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Banned {
  @Prop({ required: true, unique: true })
  ip: string;

  @Prop()
  reason?: string;
}

export type BannedDocument = Banned & Document;
export const BannedSchema = SchemaFactory.createForClass(Banned);