import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type ArchiveDocument = HydratedDocument<Archive>;

@Schema()
export class Archive {
  @Prop({
    type: String,
    trim: true,
    required: [true, 'Message is required'],
  })
  message: string;

  @Prop({
    type: String,
    trim: true,
    required: [true, 'UserId1 is required'],
  })
  userId1: string;

  @Prop({
    type: String,
    trim: true,
    required: [true, 'UserId2 is required'],
  })
  userId2: string;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const ArchiveSchema = SchemaFactory.createForClass(Archive);
