
export class UpdateUserDto {
	username?: string;
	password?: string;
	bio?: string;
	email?: string;
	status?: 'ONLINE' | 'OFFLINE' | 'INGAME';
}
