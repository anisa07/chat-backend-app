import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { APIFeatures } from 'src/helpers/APIFeatures';
import { UsersDTO } from 'src/dto/users.dto';
import { Users } from 'src/schema/users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private userModel: Model<Users>) {}

  async createUser(data: UsersDTO) {
    const user = this.userModel.create(data);

    return user;
  }

  async getUsers(query?: any) {
    const features = new APIFeatures(this.userModel.find(), query)
      .filter()
      .sort()
      .limit()
      .pagination();

    return await features.mongooseQuery;
  }

  async getUsersByUserIds(ids: string[]) {
    return this.userModel.find({
      userId: { $in: ids },
    });
  }

  async getUser(userId: string) {
    return this.userModel.findOne({ userId }).exec();
  }
}
