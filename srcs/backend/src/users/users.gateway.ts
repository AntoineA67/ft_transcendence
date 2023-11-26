import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from './users.service';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket, WsException } from '@nestjs/websockets';
import { UserDto } from 'src/dto/user.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class UsersGateway
	implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly usersService: UsersService,
	) { }

	private logger: Logger = new Logger('UsersGateway');

	async handleConnection(client: Socket) {
		const id: number = client.data.user.id;
		await this.usersService.updateUser(id, { status: 'ONLINE' });
		// client join a room 
		client.join(id.toString())
		//emit to everyone
		client.broadcast.emit('online', id);
		this.usersService.updateUser(id, { status: 'ONLINE' })
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
		return (await this.usersService.getAllUsers());
	}

	@SubscribeMessage('UpdateUsername')
	async handleUpdateUsername(@ConnectedSocket() client: Socket, @MessageBody() username: string) {
		if (typeof username != 'string') {
			return false;
		}
		const id: number = client.data.user.id;
		return (await this.usersService.updateUser(id, {username: username}))
	}
	
	@SubscribeMessage('UpdateBio')
	async handleUpdateBio(@ConnectedSocket() client: Socket, @MessageBody() bio: string) {
		if (typeof bio != 'string') {
			return false;
		}
		const id: number = client.data.user.id;
		return (await this.usersService.updateUser(id, {bio: bio}))
	}
	

	@SubscribeMessage('newAvatar')
	async handleNewAvatar(@ConnectedSocket() client: Socket, @MessageBody() data: { file: Buffer, fileName: string }) {
		const id: number = client.data.user.id;

		const fileCheck = async (file: Buffer, fileName: string) => {
			console.log(fileName);
			const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<typeof import('file-type')>);
			const type = await fileTypeFromBuffer(file);
			// if type undefined, or if file isn't image
			console.log(type);
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
	
		return (await fileCheck(data.file, data.fileName));
	}

	@SubscribeMessage('Create2FA')
	async handleCreate2FA(@ConnectedSocket() client: Socket) {
		const data = this.usersService.generate2FASecret(client.data.user);
		this.usersService.updateUser(client.data.user.id, { otpHash: (await data).secret });
		return (await data);
	}

	@SubscribeMessage('Activate2FA')
	async handleActivate2FA(@ConnectedSocket() client: Socket, @MessageBody() data) {
		if (typeof data != 'string' || data.length > 6) {
			return (false);
		}
		const isValid = await this.usersService.verify2FA(client.data.user, data);
		if (isValid === true) {
			this.usersService.updateUser(client.data.user.id, { activated2FA: true });
			return (true);
		}
		return (false);
	}

	@SubscribeMessage('Disable2FA')
	async handleDisable2FA(@ConnectedSocket() client: Socket, @MessageBody() data) {
		if (typeof data != 'string' || data.length > 6) {
			return (false);
		}
		const isValid = await this.usersService.verify2FA(client.data.user, data);
		if (isValid === true) {
			this.usersService.updateUser(client.data.user.id, { otpHash: null, activated2FA: false });
			return (true);
		}
		return (false);
	}

	@SubscribeMessage('myAvatar')
	async handleMyAvatar(@ConnectedSocket() client: Socket): Promise<string> {
		const id: number = client.data.user.id;
		return (await this.usersService.getAvatar(id))
	}

	@SubscribeMessage('ChangePassword')
	async handleChangePassword(@ConnectedSocket() client: Socket, @MessageBody() data: any): Promise<boolean> {
		if (typeof data?.oldPassowrd != 'string' || typeof data?.newPassword != 'string') {
			return (false);
		}
		if (data.oldPassword.length > 100 || data.newPassword.length > 100) {
			return (false);
		}
		if (data.oldPassowrd === '' || data.newPassword === '') {
			return (false)
		}
		const passwordRespond = await this.usersService.changePassword(
			client.data.user.id, data.oldPassword, data.newPassword
		);
		return (passwordRespond);
	}

	@SubscribeMessage('getUser')
	async handleGetUser(@MessageBody() id: number): Promise<UserDto | null> {
		if (typeof id != 'number') {
			return (null);
		}		
		return await this.usersService.getUserById(id);
	}
} 
