import 'dotenv/config';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
// import { MongooseModule } from '@nestjs/mongoose';
import { SocketConnectionModule } from './socket-connection/socket-connection.module';
import { AuthModule } from './auth/auth.module';
import { ArchiveModule } from './archive/archive.module';
import { FirebaseModule } from './firebase/firebase.module';

const mongoUrl = process.env.DATABASE_URL;

@Module({
  imports: [
    // MongooseModule.forRoot(mongoUrl),
    UsersModule,
    ArchiveModule,
    SocketConnectionModule,
    AuthModule,
    FirebaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
