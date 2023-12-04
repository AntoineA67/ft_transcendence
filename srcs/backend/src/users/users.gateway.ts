import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from './users.service';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket, WsException } from '@nestjs/websockets';
import { UserDto } from 'src/dto/user.dto';
import { BadRequestException, Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class UsersGateway
	implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly usersService: UsersService,
	) { }

	private logger: Logger = new Logger('UsersGateway');

	async handleConnection(client: Socket) {
		const id: number = client.data.user.id;
		const user = await this.usersService.getUserById(id)
		if (user.status == 'OFFLINE') {
			await this.usersService.updateUser(id, { status: 'ONLINE' });
			// client join a room 
			client.join(id.toString())
			//emit to everyone
			client.broadcast.emit('online', id);
			this.usersService.updateUser(id, { status: 'ONLINE' })
		}
	}

	async handleDisconnect(client: Socket) {
		const id: number = client.data.user.id;
		await this.usersService.updateUser(id, { status: 'OFFLINE' });
		// client leave a room 
		client.leave(id.toString())
		// emit to everyone
		client.broadcast.emit('offline', id);
		this.usersService.updateUser(id, { status: 'OFFLINE' })
	}

	@SubscribeMessage('getAllUsers')
	async handleGetAllUsers(): Promise<UserDto[]> {
		try {
			return (await this.usersService.getAllUsers());
		} catch (error) {
			return [];
		}
	}

	@SubscribeMessage('UpdateUsername')
	async handleUpdateUsername(@ConnectedSocket() client: Socket, @MessageBody() username: string) {
		try {
			if (typeof username != 'string') {
				return false;
			}
			if (username.length > 16 || username.length < 4)
				return false;
			if (await this.usersService.getUserByNick(username))
				return false;
			const id: number = client.data.user.id;
			return (await this.usersService.updateUser(id, { username: username }))
		} catch (e: any) {
			return false;
		}
	}

	@SubscribeMessage('UpdateBio')
	async handleUpdateBio(@ConnectedSocket() client: Socket, @MessageBody() bio: string) {
		try {
			if (typeof bio != 'string') {
				return false;
			}
			if (bio.length > 200) {
				return false;
			}
			const id: number = client.data.user.id;
			return (await this.usersService.updateUser(id, { bio: bio }))
		} catch (e: any) {
			return false;
		}
	}


	@SubscribeMessage('newAvatar')
	async handleNewAvatar(@ConnectedSocket() client: Socket, @MessageBody() file: Buffer) {
		const id: number = client.data.user.id;

		const fileCheck = async (file: Buffer) => {
			const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<typeof import('file-type')>);
			const type = await fileTypeFromBuffer(file);
			// if type undefined, or if file isn't image
			if (type?.ext != 'jpg' && type?.ext != 'png') {
				return (false);
			}
			// if file too big
			if (file.byteLength >= 10485760) {
				return (false);
			}
			// transform to base64
			let base64 = file.toString('base64');
			base64 = `data:image/jpeg;base64,${base64}`;
			return (await this.usersService.updateUser(id, { avatar: base64 }));
		};
		try {
			return (await fileCheck(file));
		} catch (e: any) {
			return false;
		}
	}

	@SubscribeMessage('Create2FA')
	async handleCreate2FA(@ConnectedSocket() client: Socket) {
		try {
			const data = await this.usersService.generate2FASecret(client.data.user);
			this.usersService.updateUser(client.data.user.id, { otpHash: data.secret });
			return data;
		} catch (error) {
			throw new WsException("Could not generate 2FA secret");
		}
	}

	@SubscribeMessage('Activate2FA')
	async handleActivate2FA(@ConnectedSocket() client: Socket, @MessageBody() data) {

		try {
			if (typeof data != 'string' || data.length > 6) {
				return (false);
			}
			const isValid = await this.usersService.verify2FA(client.data.user, data);
			if (isValid === true) {
				this.usersService.updateUser(client.data.user.id, { activated2FA: true });
				return (true);
			}
			return (false);
		} catch (e: any) {
			return false;
		}
	}

	@SubscribeMessage('Disable2FA')
	async handleDisable2FA(@ConnectedSocket() client: Socket, @MessageBody() data) {

		try {
			if (typeof data != 'string' || data.length > 6) {
				return (false);
			}
			const isValid = await this.usersService.verify2FA(client.data.user, data);
			if (isValid === true) {
				this.usersService.updateUser(client.data.user.id, { otpHash: null, activated2FA: false });
				return (true);
			}
			return (false);
		} catch (e: any) {
			return false;
		}
	}

	@SubscribeMessage('myAvatar')
	async handleMyAvatar(@ConnectedSocket() client: Socket): Promise<string> {
		const id: number = client.data.user.id;
		try {
			return (await this.usersService.getAvatar(id))
		} catch (error) {
			return '';
		}
	}

	@SubscribeMessage('ChangePassword')
	async handleChangePassword(@ConnectedSocket() client: Socket, @MessageBody() data: any): Promise<boolean> {

		try {
			if (typeof data?.oldPassword != 'string' || typeof data?.newPassword != 'string') {
				return (false);
			}
			const passwordRespond = await this.usersService.changePassword(
				client.data.user.id, data.oldPassword, data.newPassword
			);
			return (passwordRespond);
		} catch (e: any) {
			return false;
		}
	}

	@SubscribeMessage('getUser')
	async handleGetUser(@MessageBody() id: number): Promise<UserDto | null> {

		try {
			if (typeof id != 'number') {
				return (null);
			}
			return await this.usersService.getUserById(id);
		} catch (e: any) {
			return null;
		}
	}
} 
