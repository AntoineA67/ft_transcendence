import {    
    IsNotEmpty, 
    IsString, 
    IsEmail,
	IsNumber,
 } from "class-validator";

export class UpdateUserDto {
	@IsNumber()								id?: number;
	@IsNotEmpty() @IsString() @IsEmail() 	email?: string;
	@IsNotEmpty() @IsString()				username?: string;
	@IsNotEmpty() @IsString() 				password?: string;
	@IsString() 							bio?: string;
											avatar?: Buffer;
											status?: 'ONLINE' | 'OFFLINE' | 'INGAME';
											otpHash?: string;
											activated2FA?: boolean;
}
