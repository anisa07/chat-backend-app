import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from 'src/users/users.controller';
// import { UsersSchema, Users } from 'src/schema/users.schema';
import { UsersService } from 'src/users/users.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
    FirebaseModule,
    SocketConnectionModule,
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
