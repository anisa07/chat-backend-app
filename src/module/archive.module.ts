import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArchiveController } from '../controller/archive.controller';
import { Archive, ArchiveSchema } from '../schema/archive.schema';
import { ArchiveService } from '../service/archive.service';
import { SocketConnectionService } from 'src/socket-connection/socket-connection.service';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';
import {
  Conversation,
  ConversationSchema,
} from 'src/schema/conversation.schema';
import {
  ArchiveMessage,
  ArchiveMessageSchema,
} from 'src/schema/archive.message.schema';
import { UsersModule } from './users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Archive.name, schema: ArchiveSchema }]),
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    MongooseModule.forFeature([
      { name: ArchiveMessage.name, schema: ArchiveMessageSchema },
    ]),
    SocketConnectionModule,
    UsersModule,
  ],
  controllers: [ArchiveController],
  providers: [ArchiveService],
})
export class ArchiveModule {}
