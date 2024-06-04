import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from 'src/schema/auth.schema';
import { JwtModule } from '@nestjs/jwt';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
    // SocketConnectionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}