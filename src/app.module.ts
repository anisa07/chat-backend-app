import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './module/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ArchiveModule } from './module/archive.module';
import { SocketConnectionModule } from './socket-connection/socket-connection.module';
import { AuthModule } from './auth/auth.module';

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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
