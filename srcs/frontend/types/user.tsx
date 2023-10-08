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
	bio: string,
	gameHistory: gameHistoryType[],
	// achieve
	friend: boolean | null,   // null when the profile is user himself
	sent: boolean | null,
	block: boolean | null,    // do I block this person
	blocked: boolean | null   // does this person block me
}

export type gameHistoryType = {
	playerId: number;
	date: Date;
	win: boolean;
	against: string;
	score: string;
}