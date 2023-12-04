// Importing validation decorators from 'class-validator' package
import {    
    IsNotEmpty, 
    IsString, 
    IsEmail,
    MaxLength,
    MinLength,
 } from "class-validator";

// The DTO (Data Transfer Object) for authentication operations
export class SigninDto {
    @IsNotEmpty() @IsString() @IsEmail()
    @MaxLength(100) @MinLength(3) 
    email!: string;

    @IsNotEmpty() @IsString() 
    @MaxLength(20) @MinLength(8) 
    password!: string;
    @IsString()  token2FA?: string;
}