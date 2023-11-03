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

