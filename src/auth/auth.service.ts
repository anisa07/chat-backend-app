import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDTO } from 'src/dto/auth.dto';
import { Auth } from 'src/schema/auth.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private jwtService: JwtService,
  ) {}

  async createToken(userId: string) {
    const token = this.jwtService.sign({ sub: userId });
    await this.authModel.create({
      userId,
      token,
    });
    return token;
  }

  async getToken(data: AuthDTO) {
    const userToken = await this.authModel.findOne(data);

    if (!userToken) {
      throw new Error('Invalid token! Token not found!');
    }

    const payload = await this.jwtService.verifyAsync(userToken.token, {
      secret: process.env.JWT_SECRET_KEY,
    });

    return payload;
  }

  async deleteToken(userId: string) {
    return this.authModel.deleteOne({ userId });
  }
}
