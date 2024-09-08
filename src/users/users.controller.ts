import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { RegisterDto } from './dto/register.dto'
import { Request, Response } from 'express'
import { ResponseData } from 'common/core/response-success.dto'
import { LoginDto } from './dto/login.dto'
import { AuthGuardJwt } from 'src/auth/guards/auth.guard'

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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'] as string

    await this.usersService.logout(refreshToken)

    // Clear cookie
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')

    return new ResponseData({ message: 'Logout successfully' })
  }
}
