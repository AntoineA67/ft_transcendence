import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthIoAdapter } from './AuthIoAdapter';
import { AuthService } from './auth/auth.service';

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
	app.useWebSocketAdapter(new AuthIoAdapter(app));
	await app.listen(3000);
}
bootstrap();
