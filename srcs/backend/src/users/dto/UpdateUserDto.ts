
export class UpdateUserDto {
	username?: string;
	hashPassword?: string;
	bio?: string;
	avatar?: Buffer;
	status?: 'ONLINE' | 'OFFLINE' | 'INGAME';
	otpHash?: string;
	activated2FA?: boolean;
}
