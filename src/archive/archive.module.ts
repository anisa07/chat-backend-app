import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { ArchiveController } from '../archive/archive.controller';
// import { SocketConnectionService } from 'src/socket-connection/socket-connection.service';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';
// import {
//   Conversation,
//   ConversationSchema,
// } from 'src/schema/conversation.schema';
// import {
//   ArchiveMessage,
//   ArchiveMessageSchema,
// } from 'src/schema/archive.message.schema';
import { UsersModule } from 'src/users/users.module';
import { ArchiveService } from './archive.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    // MongooseModule.forFeature([
    //   { name: Conversation.name, schema: ConversationSchema },
    // ]),
    // MongooseModule.forFeature([
    //   { name: ArchiveMessage.name, schema: ArchiveMessageSchema },
    // ]),
    SocketConnectionModule,
    UsersModule,
    FirebaseModule,
  ],
  controllers: [ArchiveController],
  providers: [ArchiveService],
})
export class ArchiveModule {}
