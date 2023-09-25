
export class UpdateUserDto {
	username?: string;
	password?: string;
	bio?: string;
	avatar?: Buffer;
	status?: 'ONLINE' | 'OFFLINE' | 'INGAME';
}
