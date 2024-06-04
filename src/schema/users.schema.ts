import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

@Schema()
export class Users {
  @Prop({
    type: String,
    trim: true,
    required: [true, 'Name is required'],
  })
  name: string;

  @Prop({
    type: String,
    trim: true,
    required: [true, 'UserId is required'],
  })
  userId: string;

  @Prop({
    type: Boolean,
  })
  online: boolean;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
