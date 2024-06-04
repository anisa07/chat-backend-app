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
import { UsersDTO } from 'src/dto/users.dto';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() data: UsersDTO, @Res() response: any) {
    const user = await this.usersService.createUser(data);

    return response.status(201).json({
      message: 'success',
      data: user,
    });
  }

  @Get()
  async getUsers(@Res() response: any, @Req() request: any) {
    const users = await this.usersService.getUsers(request.query);

    return response.status(201).json({
      message: 'success',
      data: users,
    });
  }

  @Get(':userId')
  async findUser(@Res() response: any, @Param('userId') userId: string) {
    const user = await this.usersService.getUser(userId);

    return response.status(201).json({
      message: 'success',
      data: user,
    });
  }

  @Put(':userId')
  async updateUser(
    @Body()
    data: UsersDTO,
    @Res() response: any,
  ) {
    await this.usersService.updateUser(data);
    return response.status(201).json({
      message: 'success',
    });
  }
}
