import {    
    IsNotEmpty, 
    IsString, 
    IsEmail,
 } from "class-validator";

export class UpdateUserDto {
	@IsNotEmpty() @IsString() username?: string;
	@IsNotEmpty() @IsString() password?: string;
	@IsString() bio?: string;
	avatar?: Buffer;
	status?: 'ONLINE' | 'OFFLINE' | 'INGAME';
	otpHash?: string;
	activated2FA?: boolean;
}
