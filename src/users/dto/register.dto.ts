import { IsEmail, IsNumberString, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { IsMatch } from 'common/decorators/validation.de'

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[\p{L} ]+$/u, { message: 'Full name must only contain letters' })
  fullName: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(10)
  @IsNumberString({ no_symbols: true })
  phoneNumber: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @MinLength(6)
  @IsMatch('password', { message: 'Passwords do not match' })
  confirmPassword: string
}
