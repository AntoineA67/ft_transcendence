import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { INestApplicationContext, Logger } from '@nestjs/common';

export class AuthIoAdapter extends IoAdapter {
	private authService: AuthService;

	constructor(private app: INestApplicationContext) {
		super(app);
		this.authService = app.get(AuthService);
	}

	private logger: Logger = new Logger('IoAdapter');

	createIOServer(port: number, options?: any): any {
		const server = super.createIOServer(port, options)

		const middleware = (socket: Socket, next) => {
			let token = socket.handshake?.auth?.token;
			if (!token) {
				token = socket.handshake?.headers?.authorization;
			}
			if (!token) { next(new Error('no token')); }
			try {
				const decode = this.authService.jwtService.verify(token);
				socket.data.user = decode;
				next();
			} catch (err: any) {
				next(new Error('token invalid'))
			}
		}

		server.use(middleware);
		server.on('new_namespace', (namespace) => {
			namespace.use(middleware);
		})
		server.of('/friends');
		server.of('/chats');
		server.of('/game');

		return server;
	}
}