import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MessageDTO } from 'src/dto/message.dto';
import { createId } from 'src/helpers/helpers';
import { ArchiveMessageDTO } from 'src/dto/archive.message.dto';
import { ArchiveService } from './archive.service';
import { Response } from 'express';
import { FirebaseAuthGuard } from 'src/auth/auth.guard.middleware';

@UseGuards(FirebaseAuthGuard)
@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post()
  async saveMessage(@Body() data: MessageDTO, @Res() response: Response) {
    const participantIds = Array.from(new Set([data.fromId, ...data.toIds]));
    let conversation;

    if (data.conversationId) {
      conversation = await this.archiveService.getConversation(
        data.conversationId,
      );

      // check participant better in a case new user joins and old one leaves
      if (conversation.participantIds.length !== data.toIds.length + 1) {
        conversation = {
          ...conversation,
          participantIds,
        };

        await this.archiveService.updateConversation(conversation);
      }
    } else {
      conversation = {
        conversationId: createId(),
        participantIds,
      };

      await this.archiveService.createConversation(conversation);
    }

    const archiveMessage: ArchiveMessageDTO = {
      authorId: data.fromId,
      message: data.message,
      messageId: createId(),
      conversationId: conversation.conversationId,
      unreadBy: data.toIds.map((id) => id),
      createdAt: new Date(),
    };

    await this.archiveService.createArchiveMessage(archiveMessage);

    const participantUsers =
      await this.archiveService.getAllParticipants(participantIds);

    const participantsWithStatus = participantUsers.map((user) => {
      const userIsConnected = this.archiveService.userIsConnected(user.userId);
      return { ...user, online: userIsConnected };
    });

    this.archiveService.sendMessage({
      ...data,
      participantUsers: participantsWithStatus,
      messageId: archiveMessage.messageId,
      createdAt: archiveMessage.createdAt,
      conversationId: conversation.conversationId,
      // mark that message is read by the participants on the client side
    });

    return response.status(200).send({
      ...data,
      conversationId: conversation.conversationId,
    });
  }

  @Get(':userId/:date')
  async getAllUserConversations(
    @Res() response: Response,
    @Param('userId') userId: string,
    @Param('date') date: string,
  ) {
    const { conversations, conversationsCount } =
      await this.archiveService.getAllConversation(userId, new Date(date));
    const updatedConversations = [];

    if (!conversations || conversations.length === 0) {
      return response.status(201).send([]);
    }

    const userIds = [];
    for (const conversation of conversations) {
      userIds.push(...conversation.participantIds);
    }

    let participantUsers = [];

    if (userIds.length > 0) {
      participantUsers = await this.archiveService.getAllParticipants(userIds);
    }

    if (!participantUsers) {
      return response.status(201).send([]);
    }

    const unreadConversations =
      await this.archiveService.getUnreadMessagesConversations(
        userId,
        conversations.map((conversation) => conversation.conversationId),
      );

    const participantsMap = new Map();
    for (const user of participantUsers) {
      participantsMap.set(user.userId, {
        ...user,
        online: this.archiveService.userIsConnected(user.userId),
      });
    }

    for (const conversation of conversations) {
      const conversationParticipant = [];
      for (const participant of conversation.participantIds) {
        conversationParticipant.push(participantsMap.get(participant));
      }
      updatedConversations.push({
        conversationId: conversation.conversationId,
        participants: conversationParticipant,
        createdAt: conversation.createdAt.toDate(),
        updatedAt: conversation.updatedAt.toDate(),
        newMessage: !!unreadConversations.find(
          (unreadConversation) =>
            unreadConversation.conversationId === conversation.conversationId,
        ),
      });
    }

    return response.status(200).send({
      conversations: updatedConversations,
      conversationsCount,
    });
  }

  @Get('coversation/:userId/:conversationId/:date')
  async getUserConversation(
    @Res() response: Response,
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
    @Param('date') date: string,
  ) {
    const conversation =
      await this.archiveService.getConversation(conversationId);

    if (conversation && !conversation.participantIds.includes(userId)) {
      return response.status(200).send([]);
    }

    const { messages: conversationMessages, messageLength } =
      await this.archiveService.getConversationMessages(
        conversationId,
        new Date(date),
      );

    if (!conversationMessages) {
      return response.status(200).send([]);
    }

    const authorIds = [];
    for (const message of conversationMessages) {
      authorIds.push(message.authorId);
    }

    const authorsUsers =
      await this.archiveService.getAllParticipants(authorIds);
    const authorsMap = new Map();
    for (const author of authorsUsers) {
      authorsMap.set(author.userId, {
        ...author,
        online: this.archiveService.userIsConnected(author.userId),
      });
    }

    const updatedMessages = [];

    for (const message of conversationMessages) {
      updatedMessages.push({
        message: message.message,
        messageId: message.messageId,
        author: authorsMap.get(message.authorId),
        createdAt: message.createdAt.toDate(),
        updatedAt: message.updatedAt.toDate(),
      });
    }

    return response.status(201).send({
      messages: updatedMessages,
      messagesCount: messageLength,
    });
  }

  // check if conversation exists between two users
  @Get('new-coversation/:userId/:newUserId')
  async checkExistingConversation(
    @Res() response: Response,
    @Param('userId') userId: string,
    @Param('newUserId') newUserId: string,
  ) {
    const conversations = await this.archiveService.findParticipantConversation(
      userId,
      newUserId,
    );

    if (!conversations) {
      return response.status(201).send(null);
    }

    const conversation = conversations.find(
      (c) =>
        c.participantIds.length === 2 && c.participantIds.includes(newUserId),
    );

    if (!conversation) {
      return response.status(201).send(null);
    }

    const authorsUsers = await this.archiveService.getAllParticipants([
      userId,
      newUserId,
    ]);

    conversation.participants = authorsUsers;

    return response.status(200).send(conversation);
  }

  @Put('coversation/:conversationId/messages')
  async updateConversationMessages(
    @Body()
    data: {
      userId: string;
    },
    @Param('conversationId') conversationId: string,
    @Res() response: Response,
  ) {
    const messages =
      await this.archiveService.getConversationArchive(conversationId);
    messages.forEach(async (message) => {
      if (message.unreadBy.includes(data.userId)) {
        message.unreadBy = message.unreadBy.filter(
          (user) => user !== data.userId,
        );
      }
    });
    await this.archiveService.updateConersationMessages(
      messages,
      messages.map((message) => message.messageId),
    );
    return response.status(201).send();
  }

  @Put('coversation/:conversationId')
  async updateConversation(
    @Body()
    data: {
      conversationId: string;
      newUser: { userId: string; name: string };
      shareOldMessages: boolean;
    },
    @Param('conversationId') conversationId: string,
    @Res() response: Response,
  ) {
    let conversation =
      await this.archiveService.getConversation(conversationId);

    if (!conversation) {
      return response.status(201).send();
    }

    conversation.participantIds.push(data.newUser.userId);

    if (data.shareOldMessages) {
      const messages =
        await this.archiveService.getConversationArchive(conversationId);
      messages.forEach(async (message) => {
        message.unreadBy.push(data.newUser.userId);
      });
      await this.archiveService.updateConersationMessages(
        messages,
        messages.map((message) => message.messageId),
      );
    }

    await this.archiveService.updateConversation(conversation);

    const participantUsers = await this.archiveService.getAllParticipants(
      conversation.participantIds,
    );

    // notify new user about the conversation
    this.archiveService.notifyUser(
      data.newUser.userId,
      JSON.stringify({
        conversationId,
        participants: participantUsers,
      }),
      'join-conversation',
    );

    return response.status(201).json({
      message: 'success',
    });
  }
}
