import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersDTO } from 'src/dto/users.dto';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() data: UsersDTO, @Res() response: Response) {
    await this.usersService.createUser(data);
    return response.status(200).json({ message: 'success' });
  }

  @Get()
  async getUsers(@Res() response: Response, @Req() request: Request) {
    if (request.query) {
      const users = await this.usersService.getUsers(request.query);
      return response.status(200).json(users);
    }

    return response.status(200).json([]);
  }

  @Get(':userId')
  async findUser(@Res() response: Response, @Param('userId') userId: string) {
    const user = await this.usersService.getUser(userId);
    const userIsConnected = await this.usersService.userIsConnected(userId);
    return response
      .status(200)
      .json({ ...user, online: userIsConnected } || {});
  }

  @Put(':userId')
  async updateUser(
    @Body()
    data: UsersDTO,
    @Res() response: Response,
  ) {
    await this.usersService.updateUser(data);
    return response.status(200).json({ message: 'success' });
  }
}
