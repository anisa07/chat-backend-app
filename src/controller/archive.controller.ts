import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { MessageDTO } from 'src/dto/message.dto';
import { ArchiveService } from 'src/service/archive.service';
import { createId } from 'src/helpers/helpers';
import { ArchiveMessageDTO } from 'src/dto/archive.message.dto';

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post()
  async saveMessage(@Body() data: MessageDTO, @Res() response: any) {
    const participantIds = Array.from(new Set([data.fromId, ...data.toIds]));
    let conversation;

    console.log(data);

    if (data.conversationId) {
      conversation = await this.archiveService.getConversation(
        data.conversationId,
      );

      // check participant better in a case new user joins and old one leaves
      if (conversation.participantIds.length !== data.toIds.length + 1) {
        conversation = await this.archiveService.updateConversation(
          data.conversationId,
          participantIds,
        );
      }
    } else {
      conversation = await this.archiveService.createCoversation({
        conversationId: createId(),
        participantIds,
      });
    }

    const archiveMessage: ArchiveMessageDTO = {
      authorId: data.fromId,
      message: data.message,
      messageId: createId(),
      conversationId: conversation.conversationId,
    };

    const message =
      await this.archiveService.createArchiveMessage(archiveMessage);

    this.archiveService.sendMessage({
      ...data,
      messageId: message.messageId,
      createdAt: message.createdAt,
      conversationId: conversation.conversationId,
    });

    return response.status(201).json({
      message: 'success',
      data: {
        ...data,
        conversationId: conversation.conversationId,
      },
    });
  }

  @Get(':userId')
  async getAllUserConversations(
    @Res() response: any,
    @Param('userId') userId: string,
  ) {
    const conversations = await this.archiveService.getAllConversation(userId);
    const updatedConversations = [];

    if (!conversations) {
      return response.status(201).json({
        message: 'success',
        data: [],
      });
    }

    const userIds = [];
    for (const conversation of conversations) {
      userIds.push(...conversation.participantIds);
    }

    const participantUsers =
      await this.archiveService.getAllParticipants(userIds);

    if (!participantUsers) {
      return response.status(201).json({
        message: 'success',
        data: [],
      });
    }

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
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      });
    }

    return response.status(201).json({
      message: 'success',
      data: updatedConversations,
    });
  }

  @Get('coversation/:coversationId')
  async getUserConversation(
    @Res() response: any,
    @Param('coversationId') coversationId: string,
  ) {
    const conversationMessages =
      await this.archiveService.getConversationArchive(coversationId);

    if (!conversationMessages) {
      return response.status(201).json({
        message: 'success',
        data: [],
      });
    }

    console.log('conversationMessages', conversationMessages);

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
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });
    }

    return response.status(201).json({
      message: 'success',
      data: updatedMessages,
    });
  }

  @Get()
  async getTest(@Res() response: any, @Req() request: any) {
    const messages = await this.archiveService.getMessages(request.query);

    return response.status(201).json({
      message: 'success',
      data: messages,
    });
  }
}
