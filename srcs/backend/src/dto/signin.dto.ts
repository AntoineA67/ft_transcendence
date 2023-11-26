import {
    IsNotEmpty,
    IsString,
    IsEmail,
} from "class-validator";

export class SigninDto {
    @IsNotEmpty() @IsString() @IsEmail() email!: string;
    @IsNotEmpty() @IsString() password!: string;
    @IsString() token2FA?: string;

}