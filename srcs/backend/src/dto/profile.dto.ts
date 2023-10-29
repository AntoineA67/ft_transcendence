import { HistoryDto } from "./history.dto";
import { AchieveDto } from "./achieve.dto";

export class ProfileDto {
	id: number;
	username: string;
	bio: string;
	avatar: string | null; // ArrayBuffer
	status: 'ONLINE' | 'INGAME' | 'OFFLINE';
	gameHistory: HistoryDto[];
	achieve: AchieveDto | null;
	friend: boolean | null;   // null when the profile is user himself
	sent: boolean | null;
	block: boolean | null;
	blocked: boolean | null;
}