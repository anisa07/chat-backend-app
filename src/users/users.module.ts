import { Module } from '@nestjs/common';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [FirebaseModule, SocketConnectionModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
