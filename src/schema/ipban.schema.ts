import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class IPBans {
  @Prop({ required: true, unique: true })
  ip: string;

  @Prop()
  reason?: string;
}

export type IPBansDocument = IPBans & Document;
export const IPBansSchema = SchemaFactory.createForClass(IPBans);