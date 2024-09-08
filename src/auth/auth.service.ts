import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TYPE = 'ACCESS_TOKEN'
  private readonly JWT_REFRESH_TOKEN_TYPE = 'REFRESH_TOKEN'

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async generateToken(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId),
      this.generateRefreshToken(userId)
    ])

    return { accessToken, refreshToken }
  }

  async generateAccessToken(userId: string) {
    return await this.jwtService.signAsync(
      {
        userId: userId,
        type: this.JWT_ACCESS_TOKEN_TYPE
      },
      {
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE'),
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
      }
    )
  }

  async generateRefreshToken(userId: string) {
    return await this.jwtService.signAsync(
      {
        userId: userId,
        type: this.JWT_REFRESH_TOKEN_TYPE
      },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE'),
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
      }
    )
  }
}
