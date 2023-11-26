
export class FriendDto {
	id: number;
	username: string
	avatar: Buffer | null;
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
}