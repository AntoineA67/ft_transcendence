import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthIoAdapter } from './AuthIoAdapter';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		snapshot: true,
	});
	// app.enableCors();
	app.enableCors({
		origin: [
			'http://localhost:8000',
			'http://localhost:8000/42/callback',
			// we have to add all the subdomain here
			// whenever we fetch
			// it's a problem of cors
		],
		methods: ["GET", "POST"],
	});
	app.useWebSocketAdapter(new AuthIoAdapter(app));
	await app.listen(3000);
}
bootstrap();
