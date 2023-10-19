// Importing validation decorators from 'class-validator' package
import {    
    IsNotEmpty, 
    IsString, 
 } from "class-validator";

// The DTO (Data Transfer Object) for authentication operations
export class SigninDto {
@IsNotEmpty() @IsString()  username!: string;
@IsNotEmpty() @IsString()  password!: string;
}
