import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { MessageDTO } from 'src/dto/message.dto';
import { createId } from 'src/helpers/helpers';
import { ArchiveMessageDTO } from 'src/dto/archive.message.dto';
import { ArchiveService } from './archive.service';
import { Response } from 'express';

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

    this.archiveService.sendMessage({
      ...data,
      participantUsers,
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

  @Get(':userId')
  async getAllUserConversations(
    @Res() response: Response,
    @Param('userId') userId: string,
  ) {
    const conversations = await this.archiveService.getAllConversation(userId);
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
      participantsMap.set(user.userId, user);
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

    return response.status(200).send(updatedConversations);
  }

  @Get('coversation/:userId/:conversationId')
  async getUserConversation(
    @Res() response: Response,
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
  ) {
    const conversation =
      await this.archiveService.getConversation(conversationId);

    if (conversation && !conversation.participantIds.includes(userId)) {
      return response.status(200).send([]);
    }

    const conversationMessages =
      await this.archiveService.getConversationArchive(conversationId);

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
      authorsMap.set(author.userId, author);
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

    return response.status(201).send(updatedMessages);
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
