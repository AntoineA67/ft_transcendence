
export class UpdateUserDto {
	username?: string;
	password?: string;
	bio?: string;
	status?: 'ONLINE' | 'OFFLINE' | 'INGAME';
	otpHash?: string;
	activated2FA?: boolean;
}
