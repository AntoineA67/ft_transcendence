export class UserDto {
	id: number;
	username: string;
	avatar: ArrayBuffer | null;
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
}