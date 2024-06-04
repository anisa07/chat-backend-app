import { Injectable } from '@nestjs/common';
import { SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketConnectionService {
  constructor() {}

  private readonly connectedSockets: Map<string, Socket> = new Map();
  private socket: Socket;
  private server: Server;

  handleConnection(socket: Socket, server: Server): void {
    const userId: string =
      typeof socket.handshake.query.userId === 'string'
        ? socket.handshake.query.userId
        : socket.handshake.query.userId.join();
    this.socket = socket;
    // this.server = server;
    this.connectedSockets.set(userId, socket);

    socket.on('disconnect', () => {
      this.connectedSockets.delete(userId);
    });

    // Handle other events and messages from the client
  }

  sendMessage(userId: string, message: string, messayType: string) {
    const connectedSocket = this.connectedSockets.get(userId);

    if (connectedSocket) {
      connectedSocket.emit(messayType, message);
    }
    // console.log('connectedClient', this.socket.id);
    // if (connectedClient) {
    // console.log('message', message, this.socket.id);
    // this.server.to(this.socket.id).emit('message', message);
    // this.socket.to(this.socket.id).emit('message', message);
    // }
  }

  // @SubscribeMessage('notification')
  // handlenNotification(client: any, data: any) {
  //   //   this.logger.log(`Message received from client id: ${client.id}`);
  //   //   this.logger.debug(`Payload: ${JSON.stringify(data)}`);
  //   //   this.socketConnectionService.sendNotification(data.userId2, data.message);
  //   //   return {
  //   //     event: 'pong',
  //   //     data,
  //   //   };
  // }

  // Add more methods for handling events, messages, etc.
}
