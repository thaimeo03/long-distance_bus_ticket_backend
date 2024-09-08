import { IsEmail, IsString, MinLength } from 'class-validator'
import { IsMatch } from 'common/decorators/validation.de'

export class RegisterDto {
  @IsString()
  @MinLength(3)
  fullName: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(10)
  phoneNumber: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @MinLength(6)
  @IsMatch('password', { message: 'Passwords do not match' })
  confirmPassword: string
}
