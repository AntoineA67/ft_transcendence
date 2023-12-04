import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthIoAdapter } from './AuthIoAdapter';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		snapshot: true,
	});
	app.useGlobalPipes(new ValidationPipe());
	app.enableCors();
	app.useWebSocketAdapter(new AuthIoAdapter(app));
	
	const httpAdapter = app.get(HttpAdapterHost);
	app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
	
	await app.listen(4000);
}
bootstrap();
