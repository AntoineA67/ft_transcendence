import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:8000',
    ],
    methods: ["GET", "POST"],
  });
  // const prismaService = app.get(PrismaService);
  // await prismaService.enableShutdownHooks(app);
  await app.listen(3000);
}
bootstrap();
