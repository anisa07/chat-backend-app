import { Injectable } from '@nestjs/common';
import { SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketConnectionService {
  constructor() {}

  private readonly connectedSockets: Map<string, Socket> = new Map();
  // private socket: Socket;
  // private server: Server;

  handleConnection(socket: Socket, server: Server): void {
    const userId: string =
      typeof socket.handshake.query.userId === 'string'
        ? socket.handshake.query.userId
        : socket.handshake.query.userId.join();
    // this.socket = socket;
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
  }

  userIsConnected(userId: string) {
    console.log('Checking if user is connected', userId);
    console.log('Connected sockets', this.connectedSockets.keys());
    return this.connectedSockets.has(userId);
  }
}
