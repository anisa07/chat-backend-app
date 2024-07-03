import { Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verifyToken')
  async verifyToken(
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<any> {
    const idToken = request.headers.authorization.split('Bearer ')[1];
    const userId = request.headers.userid;

    if (!idToken) {
      throw new Error('No ID token provided');
    }

    try {
      const decodedToken = await this.authService.verifyToken(idToken);

      if (decodedToken.uid !== userId) {
        throw new Error('User ID does not match token');
      }
      return response.status(200).send(decodedToken);
    } catch (error) {
      console.log('Error verifying ID token:', error);
      throw error;
    }
  }
}
