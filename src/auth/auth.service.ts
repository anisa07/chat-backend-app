import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async verifyToken(idToken: string) {
    return this.firebaseService.verifyToken(idToken);
  }
}
