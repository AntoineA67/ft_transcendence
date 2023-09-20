
export class UpdateUserDto {
	username?: string;
	password?: string;
	bio?: string;
	status?: 'ONLINE' | 'OFFLINE' | 'INGAME';
}
