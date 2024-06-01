import { Module } from '@nestjs/common';
import { SocketConnectionService } from './socket-connection.service';
import { ChatGateway } from 'src/chat/chat.gateway';

@Module({
  providers: [ChatGateway, SocketConnectionService],
  exports: [SocketConnectionService],
})
export class SocketConnectionModule {}
