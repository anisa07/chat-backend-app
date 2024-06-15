import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { MessageDTO } from 'src/dto/message.dto';
import { createId } from 'src/helpers/helpers';
import { ArchiveMessageDTO } from 'src/dto/archive.message.dto';
import { ArchiveService } from './archive.service';

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post()
  async saveMessage(@Body() data: MessageDTO, @Res() response: any) {
    const participantIds = Array.from(new Set([data.fromId, ...data.toIds]));
    let conversation;

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
      unreadBy: data.toIds.map((id) => id),
    };

    console.log(archiveMessage);

    const message =
      await this.archiveService.createArchiveMessage(archiveMessage);

    this.archiveService.sendMessage({
      ...data,
      messageId: message.messageId,
      createdAt: message.createdAt,
      conversationId: conversation.conversationId,
      // mark that message is read by the participants on the client side
    });

    return response.status(201).json({
      message: 'success',
      data: {
        ...data,
        conversationId: conversation.conversationId,
      },
    });
  }

  // @Post('notify-participants')
  // async notifyParticipants(
  //   @Body() data: { userId: string; online: boolean; participantIds: string[] },
  //   @Res() response: any,
  // ) {
  //   // await this.archiveService.notifyParticipants(
  //   //   data.participantIds,
  //   //   data.userId,
  //   //   data.online,
  //   // );

  //   return response.status(201).json({
  //     message: 'success',
  //   });
  // }

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

    const unreadConversations =
      await this.archiveService.checkUnreadMessagesConversationCount(
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
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        newMessage: !!unreadConversations.find(
          (unreadConversation) =>
            unreadConversation.conversationId === conversation.conversationId,
        ),
      });
    }

    return response.status(201).json({
      message: 'success',
      data: updatedConversations,
    });
  }

  @Get('coversation/:userId/:conversationId')
  async getUserConversation(
    @Res() response: any,
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
  ) {
    const conversation =
      await this.archiveService.getConversation(conversationId);

    if (conversation && !conversation.participantIds.includes(userId)) {
      return response.status(201).json({
        message: 'success',
        data: [],
      });
    }

    const conversationMessages =
      await this.archiveService.getConversationArchive(conversationId);

    if (!conversationMessages) {
      return response.status(201).json({
        message: 'success',
        data: [],
      });
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
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });
    }

    return response.status(201).json({
      message: 'success',
      data: updatedMessages,
    });
  }

  @Put('coversation/:conversationId/messages')
  async updateConversationMessages(
    @Body()
    data: {
      userId: string;
    },
    @Param('conversationId') conversationId: string,
    @Res() response: any,
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
    await this.archiveService.updateConersationMessages(messages);
    return response.status(201).json({
      message: 'success',
    });
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
    @Res() response: any,
  ) {
    let conversation =
      await this.archiveService.getConversation(conversationId);

    if (!conversation) {
      return response.status(201).json({
        message: 'nothing to update',
      });
    }

    conversation.participantIds.push(data.newUser.userId);

    if (data.shareOldMessages) {
      const messages =
        await this.archiveService.getConversationArchive(conversationId);
      messages.forEach(async (message) => {
        message.unreadBy.push(data.newUser.userId);
      });
      await this.archiveService.updateConersationMessages(messages);
    }

    conversation = await this.archiveService.updateConversation(
      conversationId,
      conversation.participantIds,
    );

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

  // @Get()
  // async getTest(@Res() response: any, @Req() request: any) {
  //   const messages = await this.archiveService.getMessages(request.query);

  //   return response.status(201).json({
  //     message: 'success',
  //     data: messages,
  //   });
  // }
}
