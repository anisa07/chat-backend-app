export interface ArchiveMessageDTO {
  message: string;
  authorId: string; // userId
  messageId: string;
  conversationId: string;
  unreadBy: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
