export type Message = {
	id: number,
	message: string,
	send_date: Date,
	userId: number,
	roomId: number,
	username: string,
};

export type MemberWithLatestMessage = {
	member: Member;
	latestMessage: Message | null;
  };

  export type ProfileTest = {
	avatar: string | null;
	bio: string;
	id: number;
	status: string;
	username: string;
	membership: MemberWithLatestMessage[];
};

export type Member = {
	id: number;
	userId: number;
	roomId: number;
	room: Room;
	owner: boolean;
	admin: boolean;
	ban: boolean;
	mute: Date | null;
};

export type Room = {
    id: number;
    isChannel: boolean;
    title: string;
    private: boolean;
    password: string;
	messages: Message[];
}

export type Memberstatus = {
    owner: boolean;
    admin: boolean;
    ban: boolean;
    mute: Date | null;
};

export type Pvrooms = {
	roomId: number,
	userId2: number,
	username2: string,
	blocked: boolean,
  };