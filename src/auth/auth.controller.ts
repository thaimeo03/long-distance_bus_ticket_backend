import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Request, Response } from 'express'
import { RefreshTokenGuard } from './guards/refresh-token.guard'
import { ResponseData } from 'common/core/response-success.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('refresh-token')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['userId'] as string
    const oldRefreshToken = req.cookies.refresh_token as string

    const { accessToken, refreshToken } = await this.authService.refreshToken({ userId, oldRefreshToken })

    res.cookie('access_token', accessToken, { httpOnly: true })
    res.cookie('refresh_token', refreshToken, { httpOnly: true })

    return new ResponseData({ message: 'Refresh token successfully' })
  }
}
