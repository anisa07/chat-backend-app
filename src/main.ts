import { NestFactory } from '@nestjs/core';
// import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    //Add your origins here
    // origin: 'http://localhost:5173',
    origin: '*',
  });
  // app.use(helmet());
  await app.listen(3000);
}
bootstrap();
