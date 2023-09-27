export class ProfileDto {
	id: number;
	username: string;
	bio: string;
	avatar: Buffer | null | ArrayBuffer;
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
	// game history
	// achieve
	friend: boolean | null;   // null when the profile is user himself
	block: boolean | null;
	blocked: boolean | null;
}