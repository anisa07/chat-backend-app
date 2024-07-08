import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://chat-web-app-smoky.vercel.app', 'http://localhost:5173'],
  });
  app.use(helmet());
  await app.listen(3000);
}
bootstrap();
