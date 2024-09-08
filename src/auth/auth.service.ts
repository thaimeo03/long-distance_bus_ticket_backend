import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TYPE = 'ACCESS_TOKEN'
  private readonly JWT_REFRESH_TOKEN_TYPE = 'REFRESH_TOKEN'

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>
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

  // 1. Get new access token, refresh token
  // 2. Save new refresh token
  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateToken(userId)

    await this.userRepository.update({ id: userId }, { refreshToken })

    return { accessToken, refreshToken }
  }
}
