import { HistoryDto } from "./HistoryDto";
import { AchieveDto } from "./AchieveDto";

export class ProfileDto {
	id: number;
	username: string;
	bio: string;
	avatar: Buffer | null | ArrayBuffer;
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
	gameHistory: HistoryDto[];
	achieve: AchieveDto | null;
	friend: boolean | null;   // null when the profile is user himself
	sent: boolean | null;
	block: boolean | null;
	blocked: boolean | null;
}