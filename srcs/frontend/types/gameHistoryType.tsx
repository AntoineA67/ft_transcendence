import { Result } from "../src/pages/Stat";

export type gameHistoryType = {
	playerId: number;
	date: Date;
	win: Result;
	against: string;
	score: string;
}