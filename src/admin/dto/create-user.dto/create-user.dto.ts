import { IsString, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsNumber()
    age: number;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEmail()
    email: string;

    @IsNumber()
    sex: number;
}
