import { Body, Controller, Post, Res } from '@nestjs/common'
import { UsersService } from './users.service'
import { RegisterDto } from './dto/register.dto'
import { Response } from 'express'
import { ResponseData } from 'common/core/response-success.dto'
import { LoginDto } from './dto/login.dto'

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
}
