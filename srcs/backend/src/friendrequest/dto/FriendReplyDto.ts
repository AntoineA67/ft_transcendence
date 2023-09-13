export class FriendReplyDto {
	sendNick: string; 
	recvNick: string;
	reply: 'accept' | 'decline';
}