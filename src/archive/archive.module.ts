import { Module } from '@nestjs/common';
import { ArchiveController } from '../archive/archive.controller';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';
import { UsersModule } from 'src/users/users.module';
import { ArchiveService } from './archive.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [SocketConnectionModule, UsersModule, FirebaseModule, AuthModule],
  controllers: [ArchiveController],
  providers: [ArchiveService],
})
export class ArchiveModule {}
