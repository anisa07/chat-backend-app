import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
import { UsersDTO } from 'src/dto/users.dto';
// import { Users } from 'src/schema/users.schema';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(
    // @InjectModel(Users.name) private userModel: Model<Users>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async createUser(data: UsersDTO) {
    return this.firebaseService.saveValue('users', data.userId, data);
  }

  async getUsers(query: Record<string, any>) {
    // TODO create better solution for filtering
    const queryKey = Object.keys(query)[0];
    const users = await this.firebaseService.getSpecificValue(
      'users',
      queryKey,
      query[queryKey],
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
}
