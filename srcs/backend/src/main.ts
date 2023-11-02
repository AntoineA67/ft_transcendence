import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthIoAdapter } from './AuthIoAdapter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		snapshot: true,
	});
	app.useGlobalPipes(new ValidationPipe());
	app.enableCors();
	app.useWebSocketAdapter(new AuthIoAdapter(app));
	await app.listen(4000);
}
bootstrap();
