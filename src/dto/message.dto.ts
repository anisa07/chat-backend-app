export interface MessageDTO {
  message: string;
  fromId: string; // userId
  toIds: string[]; // userId []
  messageId?: string;
  conversationId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
