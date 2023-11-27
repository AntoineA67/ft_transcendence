import { EnqueueSnackbar } from "notistack";

export type Message = {
	id: number,
	message: string,
	send_date: Date,
	userId: number,
	roomId: number,
	username: string,
};

export type Block = {
	userId: number,
	blockedId: number,
};

export type MemberWithLatestMessage = {
	member: Member;
	latestMessage: Message | null;
};

export type Profile = {
	bio: string;
	id: number;
	status: string;
	username: string;
	membership: MemberWithLatestMessage[];
	pvrooms: Pvrooms[];
	blocks: Block[];
};

export type Member = {
	id: number;
	userId: number;
	username: string;
	roomId: number;
	room: Room;
	owner: boolean;
	admin: boolean;
	ban: boolean;
	mute: Date | null;
	muteduration: number;
};

export type Room = {
	id: number;
	isChannel: boolean;
	title: string;
	private: boolean;
	password: string;
	messages: Message[];
}

export type Pvrooms = {
	roomId: number,
	userId2: number,
	username2: string,
	block: boolean,
	blocked: boolean,
};

export type ChatBoxData = {
	messages: Message[],
	roomTitle: string,
	roomChannel: boolean,
	members: Member[],
	memberStatus: Member,
	private: boolean,
	password: boolean,
	profile: Profile,
};

export interface ChannelCreationResponse {
	success: boolean;
	roomId?: number;
	error?: string;
}

export function containsUnprintableCharacters(input: string, enqueueSnackbar: EnqueueSnackbar) {
	const printableCharactersRegex = /^[ -~]*$/;
	if (!printableCharactersRegex.test(input)) {
		enqueueSnackbar('Input contains unprintable characters (including no line break)', { variant: 'error' });
		return true;
	}
	return false;
}

export function checkUserRoomName(newRoomTitle: string, enqueueSnackbar: EnqueueSnackbar, type: string) {
	const printable = containsUnprintableCharacters(newRoomTitle, enqueueSnackbar);
	if (printable) {
		return false;
	}
	const bool = newRoomTitle && /^[A-Za-z0-9-]{3,16}$/.test(newRoomTitle);
	if (bool === false) {
		enqueueSnackbar(type + ' must be between 4 and 16 characters long and contain only alphanumeric characters and dashes', { variant: 'error' });
	}
	return bool;
}

export function checkPassword(newPassword: string, enqueueSnackbar: EnqueueSnackbar) {
	const printable = containsUnprintableCharacters(newPassword, enqueueSnackbar);
	if (printable) {
		return false;
	}
	const bool = newPassword && newPassword.length >= 8 && newPassword.length <= 20 && /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/.test(newPassword);
	if (bool === false) {
		enqueueSnackbar('Password must be between 8 and 20 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character', { variant: 'error' });
	}
	return (bool);
}

export function checkBio(newBio: string, enqueueSnackbar: EnqueueSnackbar) {
	const printable = containsUnprintableCharacters(newBio, enqueueSnackbar);
	if (printable) {
		return false;
	}
	const bool = newBio && newBio.length <= 200;
	if (!newBio) {
		return true;
	}
	if (bool === false) {
		enqueueSnackbar('Bio must be less than 200 characters long', { variant: 'error' });
	}
	return bool;
}