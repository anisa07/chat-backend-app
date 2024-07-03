import 'dotenv/config';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UsersModule } from './users/users.module';
// import { MongooseModule } from '@nestjs/mongoose';
import { SocketConnectionModule } from './socket-connection/socket-connection.module';
import { AuthModule } from './auth/auth.module';
import { ArchiveModule } from './archive/archive.module';
import { FirebaseModule } from './firebase/firebase.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { UsersController } from './users/users.controller';
import { ArchiveController } from './archive/archive.controller';

@Module({
  imports: [
    UsersModule,
    ArchiveModule,
    SocketConnectionModule,
    AuthModule,
    FirebaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(UsersController, ArchiveController);
  }
}
