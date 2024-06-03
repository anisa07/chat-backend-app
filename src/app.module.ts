import 'dotenv/config';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketConnectionModule } from './socket-connection/socket-connection.module';
import { AuthModule } from './auth/auth.module';
import { ArchiveModule } from './archive/archive.module';

const mongoUrl = process.env.DATABASE_URL;

console.log(mongoUrl);
@Module({
  imports: [
    MongooseModule.forRoot(mongoUrl),
    UsersModule,
    ArchiveModule,
    SocketConnectionModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
