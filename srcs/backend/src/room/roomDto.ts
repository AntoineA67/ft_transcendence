import { Member, Message } from "@prisma/client";

import {
    IsNotEmpty,
    IsString,
    MinLength,
    Matches,
    IsBoolean,
	MaxLength
} from "class-validator";


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

export class ChannelCreationDto {
    @IsNotEmpty()
	@IsString()
	@MinLength(4, {message: "Room Title must contains at least 4 characters."})
	@MaxLength(16, {message: "Room Title must contains less than 16 characters."})
	roomTitle!: string;
    
	@IsBoolean() 
	isPublic!: boolean;
 
	@IsNotEmpty()
    @IsString()
    @MinLength(8, {message: "Password must be at least 8 characters long" })
	@MaxLength(20, {message: "Password must be less than 20 characters"})
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/,
        { message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" })
    password?: string;
}

