import {    
    IsNotEmpty, 
    IsString, 
    IsEmail,
    IsBoolean,
    IsNumber,
    isBoolean,
 } from "class-validator";

export class Intra42Dto {
    @IsNumber()                             id!: number;
    @IsNotEmpty() @IsString() @IsEmail()    email!: string;
    @IsNotEmpty() @IsString()               token2FA: string;
    @IsNotEmpty() @IsBoolean()              activated2FA: boolean;
                                            user: any;
    @IsString()                             firstConnexion: string;
}
