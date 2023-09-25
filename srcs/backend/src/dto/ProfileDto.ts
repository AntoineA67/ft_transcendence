export class ProfileDto {
	id: number;
	username: string;
	bio: string;
	avatar: Buffer | null | ArrayBuffer;
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
	// game history
}