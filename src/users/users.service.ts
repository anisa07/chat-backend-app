import { Injectable } from '@nestjs/common';
import { UsersDTO } from 'src/dto/users.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { SocketConnectionService } from 'src/socket-connection/socket-connection.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private socketConnectionService: SocketConnectionService,
  ) {}

  async createUser(data: UsersDTO) {
    return this.firebaseService.saveValue('users', data.userId, data);
  }

  async getUsers(query: Record<string, any>) {
    // TODO create better solution for filtering
    const queryKey = Object.keys(query)[0];
    if (!query[queryKey]) return [];
    const capitalQueryValue =
      query[queryKey].charAt(0).toUpperCase() + query[queryKey].slice(1);
    const users = await this.firebaseService.getSpecificValue(
      'users',
      queryKey,
      capitalQueryValue,
    );
    return users || [];
  }

  async getUsersByUserIds(ids: string[]) {
    return this.firebaseService.getUsersCollections(ids);
  }

  async getUser(userId: string) {
    return this.firebaseService.getValue(`users`, userId);
  }

  async updateUser(data: UsersDTO) {
    return this.firebaseService.updateValue(`users`, data.userId, data);
  }

  userIsConnected(userId: string) {
    return this.socketConnectionService.userIsConnected(userId);
  }
}
