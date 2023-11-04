// Importing validation decorators from 'class-validator' package
import {    
    IsNotEmpty, 
    IsString, 
    IsEmail,
 } from "class-validator";

// The DTO (Data Transfer Object) for authentication operations
export class SigninDto {
    @IsNotEmpty() @IsString() @IsEmail() email!: string;
    @IsNotEmpty() @IsString()  password!: string;
    @IsString()  token2FA?: string;
    // token2FA?: string;
}