import { Member, Message } from "@prisma/client";



export type MessageWithUsername = {
    id: number;
    message: string;
    send_date: Date;
    userId: number;
    roomId: number;
    username: string;
};

export type Block = {
    id: number,
    userId: number,
    blockedId: number;
};

export type ProfileTest = {
    bio: string;
    id: number;
    status: string;
    username: string;
    membership: MemberWithLatestMessage[];
    pvrooms: Pvrooms[] | null;
    blocks: Block[];
};

export type Pvrooms = {
    roomId: number,
    userId2: number,
    username2: string,
    block: boolean,
    blocked: boolean,
};

export type MemberWithLatestMessage = {
    member: Member;
    latestMessage: Message | null;
};

export interface ChannelCreationResponse {
    success: boolean;
    roomId?: number;
    error?: string;
}

export function containsUnprintableCharacters(input: string) {
    const printableCharactersRegex = /^[ -~]*$/;
    if (!printableCharactersRegex.test(input)) {
        return true;
    }
    return false;
}

export function checkUserRoomName(newRoomTitle: string) {
	const printable = containsUnprintableCharacters(newRoomTitle);
	if (printable) {
		return false;
	}
	const bool = newRoomTitle && /^[A-Za-z0-9-]{3,16}$/.test(newRoomTitle);
	return bool;
}

export function checkPassword(newPassword: string) {
	const printable = containsUnprintableCharacters(newPassword);
	if (printable) {
		return false;
	}
	const bool = newPassword && newPassword.length >= 8 && newPassword.length <= 20 && /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/.test(newPassword);
	return (bool);
}