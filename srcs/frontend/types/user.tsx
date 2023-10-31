import { AchieveType } from "./Achieve";
import { gameHistoryType } from "./gameHistoryType";

export type userType = {
	id: number;
	username: string;
	avatar: string | null; // ArrayBuffer
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
}

export type profileType = {
	id: number,
	password: boolean,
	username: string,
	avatar: string | null,
	status: 'ONLINE' | 'OFFLINE' | 'INGAME',
	bio: string,
	activated2FA: boolean,
	gameHistory: gameHistoryType[],
	achieve: AchieveType,
	friend: boolean | null,   // null when the profile is user himself
	sent: boolean | null,
	block: boolean | null,    // do I block this person
	blocked: boolean | null   // does this person block me
}
