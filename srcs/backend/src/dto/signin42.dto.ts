// Importing validation decorators from 'class-validator' package
import {    
    IsNotEmpty, 
    IsString, 
    IsEmail,
    IsBoolean,
    IsNumber,
    isBoolean,
 } from "class-validator";

// The DTO (Data Transfer Object) for authentication operations
export class Signin42Dto {
    @IsNumber()                             id!: number;
    @IsNotEmpty() @IsString() @IsEmail()    email!: string;
    @IsNotEmpty() @IsString()               token2FA: string;
    @IsNotEmpty() @IsBoolean()              activated2FA: boolean;
                                            user: any;
    @IsString()                             firstConnexion: string;
}