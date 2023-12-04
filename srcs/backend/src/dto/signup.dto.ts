// Importing validation decorators from 'class-validator' package
import {
    IsNotEmpty,
    IsString,
    IsEmail,
    MinLength,
    Matches,
    MaxLength,
} from "class-validator";

export class SignupDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @MaxLength(100, { message: "Email must be less than 100 characters long" })
    @MinLength(3, { message: "Email must be at least 3 characters long" })
    email!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(16, { message: "Username must be less than 16 characters long" })
    @MinLength(3, { message: "Username must be at least 3 characters long" })
    @Matches(/^[A-Za-z0-9]*$/,
        { message: "Username should contain only alphanumeric characters and dashes." })
    username!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(20, { message: "Password must be less than 20 characters long" })
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/,
        { message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" })
    password!: string;
}