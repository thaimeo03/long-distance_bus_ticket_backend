import { IsEmail, IsNumberString, MinLength } from 'class-validator'

export class VerifyForgotPasswordOTPDto {
  @IsEmail()
  email: string

  @IsNumberString()
  @MinLength(6)
  OTP: string
}
