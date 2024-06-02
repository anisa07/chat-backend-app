import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthDocument = HydratedDocument<Auth>;

@Schema()
export class Auth {
  @Prop({
    type: String,
    trim: true,
    required: [true, 'Token is required'],
  })
  token: string;

  @Prop({
    type: String,
    trim: true,
    required: [true, 'UserId is required'],
  })
  userId: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
