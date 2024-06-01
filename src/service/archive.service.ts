import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDTO } from '../dto/message.dto';
import { Archive } from '../schema/archive.schema';
import { APIFeatures } from 'src/helpers/APIFeatures';
// import { WebSocketServer } from '@nestjs/websockets';
// import { Server } from 'socket.io';
import { SocketConnectionService } from 'src/socket-connection/socket-connection.service';
import { Conversation } from 'src/schema/conversation.schema';
import { ConversationDTO } from 'src/dto/conversation.dto';
import { ArchiveMessageDTO } from 'src/dto/archive.message.dto';
import { ArchiveMessage } from 'src/schema/archive.message.schema';
import { History } from 'src/schema/history.schema';
import { HistoryDTO } from 'src/dto/history.dto';
import { UsersService } from './users.service';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectModel(Archive.name) private archiveModel: Model<Archive>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(ArchiveMessage.name)
    private archiveMessageModel: Model<ArchiveMessage>,
    @InjectModel(History.name)
    private historyModel: Model<History>,
    private socketConnectionService: SocketConnectionService,
    private readonly usersService: UsersService,
  ) {}

  async sendMessage(data: MessageDTO) {
    const user = await this.usersService.getUser(data.fromId);

    if (!user) return;

    // check if a user doesn't send a message to themself so also send message back to a user to show the message in history
    if (!data.toIds.includes(data.fromId)) {
      this.socketConnectionService.sendMessage(
        user.userId,
        JSON.stringify({
          message: data.message,
          conversationId: data.conversationId,
          from: {
            name: user.name,
            userId: user.userId,
          },
          createdAt: data.createdAt,
          messageId: data.messageId,
        }),
      );
    }

    for (const userId of data.toIds) {
      this.socketConnectionService.sendMessage(
        userId,
        JSON.stringify({
          message: data.message,
          conversationId: data.conversationId,
          from: {
            name: user.name,
            userId: user.userId,
          },
          createdAt: data.createdAt,
          messageId: data.messageId,
        }),
      );
    }
  }

  async getConversation(conversationId: string) {
    return this.conversationModel.findOne({ conversationId });
  }

  async getConversationHistory(conversationId: string) {
    return this.historyModel.findOne({ conversationId });
  }

  async getConversationMessages(messageIds: string[]) {
    return this.archiveMessageModel.find({
      messageId: { $in: messageIds },
    });
  }

  async getAllConversation(userId: string) {
    return this.conversationModel.find({ participantIds: userId });
  }

  async getAllParticipants(participantIds: string[]) {
    return this.usersService.getUsersByUserIds(participantIds);
  }

  async updateConversation(conversationId: string, ids: string[]) {
    return this.conversationModel.findOneAndUpdate(
      { conversationId },
      { participantIds: ids },
      { new: true },
    );
  }

  async createCoversation(conversation: ConversationDTO) {
    return this.conversationModel.create(conversation);
  }

  async createArchiveMessage(archiveMessage: ArchiveMessageDTO) {
    return this.archiveMessageModel.create(archiveMessage);
  }

  async createHistoryMessage(historyMessage: HistoryDTO) {
    return this.historyModel.create(historyMessage);
  }

  async getHistory(conversationId: string) {
    return this.historyModel.findOne({ conversationId });
  }

  async updateHistory(conversationId: string, ids: string[]) {
    return this.historyModel.findOneAndUpdate(
      { conversationId },
      { messageIds: ids },
      { new: true },
    );
  }

  async getMessages(query: any) {
    const features = new APIFeatures(this.archiveModel.find(), query)
      .filter()
      .sort()
      .limit()
      .pagination();
    return await features.mongooseQuery;
  }
}
