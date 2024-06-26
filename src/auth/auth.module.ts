import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from 'src/schema/auth.schema';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    // JwtModule.register({
    //   global: true,
    //   secret: process.env.JWT_SECRET_KEY,
    //   signOptions: { expiresIn: '1d' },
    // }),
    FirebaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
