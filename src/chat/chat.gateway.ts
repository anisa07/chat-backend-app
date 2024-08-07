import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { SocketConnectionService } from 'src/socket-connection/socket-connection.service';

@WebSocketGateway(
  { cors: '*:*' },
  // cors: {
  //   origin: '*',
  //   // methods: ['GET', 'POST'],
  //   // allowedHeaders: ['my-custom-header'],
  //   // credentials: true,
  // },
)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly socketConnectionService: SocketConnectionService,
  ) {}

  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer() server: Server;

  afterInit() {
    this.logger.log('Initialized');
  }

  handleConnection(socket: Socket) {
    const { sockets } = this.server.sockets;

    // Enable CORS for WebSocket
    // this.server.emit('headers', {
    //   'Access-Control-Allow-Origin': '*',
    //   'Access-Control-Allow-Credentials': 'true',
    // });

    this.logger.log(`Client id: ${socket.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);

    this.socketConnectionService.handleConnection(socket, this.server);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('notification')
  handleMessage(_: any, message: any) {
    const data = JSON.parse(message);
    for (const id of data.participantIds) {
      this.socketConnectionService.sendMessage(
        id,
        JSON.stringify({
          userId: data.userId,
          online: data.online,
        }),
        'user-online-status',
      );
    }
  }

  @SubscribeMessage('user-typing')
  handleTyping(_: any, message: string) {
    const data = JSON.parse(message);
    for (const id of data.participantIds) {
      this.socketConnectionService.sendMessage(
        id,
        JSON.stringify({
          conversationId: data.conversationId,
          user: data.user,
          userId: data.userId,
          typing: data.typing,
        }),
        'typing',
      );
    }
  }
}
