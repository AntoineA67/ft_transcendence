export class UserDto {
	id: number;
	username: string;
	bio: string;
	avatar: ArrayBuffer | null;
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
	// game history
}