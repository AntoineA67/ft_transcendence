
export class FriendDto {
	id: number;
	username: string
	avatar: Buffer | null; // ArrayBuffer
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
}