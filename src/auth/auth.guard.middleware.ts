import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const idToken = request.headers.authorization.split('Bearer ')[1];

    if (!idToken) {
      return false; // or throw an UnauthorizedException
    }

    return this.validateToken(idToken, request);
  }

  private async validateToken(idToken: string, request: any): Promise<boolean> {
    try {
      const decodedToken = await this.authService.verifyToken(idToken);
      request.user = decodedToken; // Attach the user to the request object
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false; // or throw an UnauthorizedException
    }
  }
}
