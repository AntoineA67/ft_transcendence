export type userType = {
	id: number;
	username: string;
	avatar: Buffer | null | ArrayBuffer;
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
}

export type profileType = {
	id: number,
	username: string,
	avatar: null,
	status: 'ONLINE' | 'OFFLINE' | 'INGAME',
	bio: string
	// game history
	// achieve
}