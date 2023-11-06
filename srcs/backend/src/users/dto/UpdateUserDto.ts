import { IsNumber, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
	@IsNumber({}, { message: "Invalid user ID" })
	id?: number;

	@IsEmail({}, { message: "Invalid email format" })
	email?: string;

	@IsString({ message: "Invalid username" })
	@MinLength(4, { message: "Username must be at least 4 characters long" })
	@MaxLength(16, { message: "Username must be at most 16 characters long" })
	username?: string;

	@IsString({ message: "Invalid password" })
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	@MaxLength(20, { message: "Password must be at most 20 characters long" })
	@Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, { message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" })
	password?: string;

	@IsString({ message: "Invalid bio" })
	@MinLength(10, { message: "Bio must be at least 0 characters long" })
	@MaxLength(200, { message: "Bio must be less than 200 characters long" })
	bio?: string;

	avatar?: string;

	status?: 'ONLINE' | 'OFFLINE' | 'INGAME';

	otpHash?: string;

	activated2FA?: boolean;
}