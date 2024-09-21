import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { RegisterDto } from './dto/register.dto'
import { Request, Response } from 'express'
import { ResponseData } from 'common/core/response-success.dto'
import { LoginDto } from './dto/login.dto'
import { AuthGuardJwt } from 'src/auth/guards/auth.guard'
import { UpdateUserDto } from './dto/update-user.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { VerifyForgotPasswordOTPDto } from './dto/verify-forgot-password-OTP.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.usersService.register(registerDto)

    res.cookie('access_token', accessToken, { httpOnly: true })
    res.cookie('refresh_token', refreshToken, { httpOnly: true })

    return new ResponseData({ message: 'Register successfully' })
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.usersService.login(loginDto)

    res.cookie('access_token', accessToken, { httpOnly: true })
    res.cookie('refresh_token', refreshToken, { httpOnly: true })

    return new ResponseData({ message: 'Login successfully' })
  }

  @Post('logout')
  @UseGuards(AuthGuardJwt)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['userId'] as string

    await this.usersService.logout(userId)

    // Clear cookie
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')

    return new ResponseData({ message: 'Logout successfully' })
  }

  @Get('me')
  @UseGuards(AuthGuardJwt)
  async getProfile(@Req() req: Request) {
    const userId = req.user['userId'] as string

    const data = await this.usersService.getProfile(userId)

    return new ResponseData({ message: 'Get profile successfully', data })
  }

  @Patch('me')
  @UseGuards(AuthGuardJwt)
  async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user['userId'] as string

    await this.usersService.updateProfile({ userId, updateUserDto })

    return new ResponseData({ message: 'Update profile successfully' })
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto

    const data = await this.usersService.forgotPassword(email)

    return new ResponseData({ message: 'Please check your email', data })
  }

  @Post('forgot-password/verify-otp')
  async verifyForgotPasswordOTP(@Body() verifyForgotPasswordOTPDto: VerifyForgotPasswordOTPDto) {
    const data = await this.usersService.verifyForgotPasswordOTP(verifyForgotPasswordOTPDto)

    return new ResponseData({ message: 'Verify OTP successfully', data })
  }

  @Post('forgot-password/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.usersService.resetPassword(resetPasswordDto)

    return new ResponseData({ message: 'Reset password successfully' })
  }
}
