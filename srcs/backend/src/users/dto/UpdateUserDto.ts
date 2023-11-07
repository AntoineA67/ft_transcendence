import { IsNumber, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
	id?: number;
	email?: string;
	username?: string;
	password?: string;
	bio?: string;
	avatar?: string;
	status?: 'ONLINE' | 'OFFLINE' | 'INGAME';
	otpHash?: string;
	activated2FA?: boolean;
	firstConnexion?: string;
}
