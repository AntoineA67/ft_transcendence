import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  app.enableCors({
    origin: [
      'http://localhost:8000',
    ],
    methods: ["GET", "POST"],
  });
  await app.listen(3000);
}
bootstrap();
