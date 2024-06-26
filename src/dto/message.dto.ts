import { UsersDTO } from './users.dto';

export interface MessageDTO {
  message: string;
  fromId: string; // userId
  toIds: string[]; // userId []
  messageId?: string;
  conversationId: string;
  createdAt?: Date;
  updatedAt?: Date;
  participantUsers: UsersDTO[];
}
