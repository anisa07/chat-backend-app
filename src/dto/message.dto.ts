export interface MessageDTO {
  message: string;
  fromId: string; // userId
  toIds: string[]; // userId []
  createdAt?: Date;
  messageId?: string;
  conversationId: string;
}
