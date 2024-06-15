import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type ArchiveMessageDocument = HydratedDocument<ArchiveMessage>;

@Schema({ versionKey: false })
export class ArchiveMessage {
  @Prop({
    type: String,
    trim: true,
    required: [true, 'Message is required'],
  })
  message: string;

  @Prop({
    type: String,
    trim: true,
    required: [true, 'MessageId is required'],
  })
  messageId: string;

  @Prop({
    type: String,
    trim: true,
    required: [true, 'Author is required'],
  })
  authorId: string;

  @Prop({
    type: String,
    trim: true,
    required: [true, 'Conversation is required'],
  })
  conversationId: string;

  @Prop({
    type: Array<String>,
  })
  unreadBy: string[];

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const ArchiveMessageSchema =
  SchemaFactory.createForClass(ArchiveMessage);
