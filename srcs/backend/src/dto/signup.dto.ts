// Importing validation decorators from 'class-validator' package
import {
    IsNotEmpty,
    IsString,
    IsEmail,
    MinLength,
    Matches,
} from "class-validator";

export class SignupDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @MinLength(4, { message: "Username must be at least 4 characters long" })
    @IsString()
    username!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/,
        { message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" })
    password!: string;
}