import { Injectable } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';
import { jwtConstants } from './auth/constants';
import { AuthService } from './auth/auth.service';
import { INestApplicationContext, Logger } from '@nestjs/common';

// @Injectable()
export class AuthIoAdapter extends IoAdapter {
	private authService: AuthService;
	
	constructor(private app: INestApplicationContext) {
		super(app);
		this.authService = app.get(AuthService);
	}

	private logger: Logger = new Logger('IoAdapter');

	createIOServer(port: number, options?: any): any {
		const server = super.createIOServer(port, options)
		server.use((socket: Socket, next) => {
			const token = socket.handshake?.auth?.token;
			if (!token) { next(new Error('no token')); }
			try {
				const decode = this.authService.jwtService.verify(token);
				socket.data.user = decode;
				this.logger.log('decode: ', decode);
				next();
			} catch (err: any) {
				next(new Error('token invalid'))
			}
		})
		return server;
	}
}