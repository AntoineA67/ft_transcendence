
export class FriendDto {
	id: number;
	username: string
	avatar: ArrayBuffer | null;
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
}