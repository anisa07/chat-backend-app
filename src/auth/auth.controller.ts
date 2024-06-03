import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async createToken(@Body() data: { userId: string }, @Res() response: any) {
    const token = await this.authService.createToken(data.userId);

    return response.status(201).json({
      message: 'success',
      token,
    });
  }

  @Get(':userId')
  async verifyToken(
    @Res() response: any,
    @Param('userId') userId: string,
    @Req() request: any,
  ) {
    const token = request.headers.token ?? '';

    try {
      await this.authService.getToken({
        userId,
        token,
      });
      return response.status(201).json({
        message: 'success',
        verified: true,
      });
    } catch (error) {
      if (
        error.message === 'Invalid token! Token not found!' ||
        error.message === 'Invalid token'
      ) {
        return response.status(400).json({
          message: 'invalid user data',
          verified: false,
        });
      }
      this.authService.deleteToken(request.params.userId);
      return response.status(401).json({
        message: 'token is expired',
        verified: false,
      });
    }
  }

  @Delete(':userId')
  async deleteToken(@Res() response: any, @Req() request: any) {
    console.log('deleteToken request.params', request.params);

    await this.authService.deleteToken(request.params.userId);

    return response.status(201).json({
      message: 'success',
      data: 'Token deleted',
    });
  }
}
