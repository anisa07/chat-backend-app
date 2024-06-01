import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type HystoryDocument = HydratedDocument<History>;

@Schema()
export class History {
  @Prop({
    type: Array<String>,
    trim: true,
    required: [true, 'Messages are required'],
  })
  messageIds: string[];

  @Prop({
    type: String,
    trim: true,
    required: [true, 'Conversation is required'],
  })
  conversationId: string;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);
