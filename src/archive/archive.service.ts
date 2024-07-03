import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { MessageDTO } from '../dto/message.dto';
// import { APIFeatures } from 'src/helpers/APIFeatures';
// import { WebSocketServer } from '@nestjs/websockets';
// import { Server } from 'socket.io';
import { SocketConnectionService } from 'src/socket-connection/socket-connection.service';
// import { Conversation } from 'src/schema/conversation.schema';
import { ConversationDTO } from 'src/dto/conversation.dto';
import { ArchiveMessageDTO } from 'src/dto/archive.message.dto';
import { ArchiveMessage } from 'src/schema/archive.message.schema';
import { UsersService } from 'src/users/users.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class ArchiveService {
  constructor(
    // @InjectModel(Conversation.name)
    // // private conversationModel: Model<Conversation>,
    // @InjectModel(ArchiveMessage.name)
    // private archiveMessageModel: Model<ArchiveMessage>,

    private socketConnectionService: SocketConnectionService,
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async sendMessage(data: MessageDTO) {
    const messageAuthor = data.participantUsers.find(
      (user) => user.userId === data.fromId,
    );
    for (const user of data.participantUsers) {
      this.notifyUser(
        user.userId,
        JSON.stringify({
          message: data.message,
          from: {
            userId: messageAuthor?.userId,
            name: messageAuthor?.name,
            online: this.socketConnectionService.userIsConnected(
              messageAuthor?.userId,
            ),
          },
          createdAt: data.createdAt,
          messageId: data.messageId,
          conversationId: data.conversationId,
          participants: data.participantUsers,
        }),
        'message',
      );
    }
  }

  async getConversation(conversationId: string) {
    return this.firebaseService.getValue('conversations', conversationId);
  }

  async getConversationArchive(conversationId: string) {
    return this.firebaseService.getSpecificValue(
      'archiveMessages',
      'conversationId',
      conversationId,
    );
    // return this.archiveMessageModel.find({ conversationId });
  }

  async getConversationMessages(messageIds: string[]) {
    return this.firebaseService.getConversationMessages(messageIds);
    // return this.archiveMessageModel.find({
    //   messageId: { $in: messageIds },
    // });
  }

  async getAllConversation(userId: string) {
    return this.firebaseService.getAllUserConversation(userId);
  }

  async getAllParticipants(participantIds: string[]) {
    return this.usersService.getUsersByUserIds(participantIds);
  }

  async getUnreadMessagesConversations(
    userId: string,
    conversationIds: string[],
  ) {
    // return this.archiveMessageModel
    //   .find({
    //     conversationId: { $in: conversationIds },
    //   })
    //   .where({ unreadBy: userId });
    return this.firebaseService.getUserUnreadMessages(userId, conversationIds);
  }

  async updateConversation(conversation: ConversationDTO) {
    await this.firebaseService.updateValue(
      'conversations',
      conversation.conversationId,
      conversation,
    );
  }

  async updateConersationMessages(
    messages: ArchiveMessage[],
    messageIds: string[],
  ) {
    await this.firebaseService.updateSeveralValues(
      'archiveMessages',
      messageIds,
      messages,
    );
    // messages.forEach(async (message) => {
    //   await message.save();
    // });
  }

  async createConversation(conversation: ConversationDTO) {
    await this.firebaseService.saveValue(
      'conversations',
      conversation.conversationId,
      conversation,
    );
  }

  async createArchiveMessage(archiveMessage: ArchiveMessageDTO) {
    await this.firebaseService.saveValue(
      'archiveMessages',
      archiveMessage.messageId,
      archiveMessage,
    );
  }

  notifyUser(userId: string, message: string, messayType: string) {
    return this.socketConnectionService.sendMessage(
      userId,
      message,
      messayType,
    );
  }

  userIsConnected(userId: string) {
    return this.socketConnectionService.userIsConnected(userId);
  }
}
