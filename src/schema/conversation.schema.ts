import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema()
export class Conversation {
  @Prop({
    type: Array<String>,
    trim: true,
    required: [true, 'Participnats are required'],
  })
  participantIds: string[];

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

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
