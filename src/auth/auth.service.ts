import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { Repository } from 'typeorm'
import { GoogleProfileDto } from './dto/google-profile.dto'
import { el } from '@faker-js/faker'

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

  // 1. Check refresh token
  // 2. Get new access token, refresh token
  // 3. Save new refresh token
  async refreshToken({ userId, oldRefreshToken }: { userId: string; oldRefreshToken: string }) {
    // 1
    const user = await this.userRepository.findOneBy({ id: userId })
    if (user.refreshToken !== oldRefreshToken) throw new UnauthorizedException()

    // 2
    const { accessToken, refreshToken } = await this.generateToken(userId)

    // 3
    await this.userRepository.update({ id: userId }, { refreshToken })

    return { accessToken, refreshToken }
  }

  // 1. Find user by email
  // 2. Create user if not exists
  // 3. Update draft is false if user exists and is draft
  // 4. Generate token
  // 5. Save refresh token and return token
  async googleOAuthLogin(profile: GoogleProfileDto) {
    // 1
    const { email, fullName } = profile
    let user = await this.userRepository.findOneBy({ email: profile.email })

    // 2
    if (!user) {
      user = this.userRepository.create({
        fullName,
        email,
        isDraft: false
      })
      user = await this.userRepository.save(user)
    } else {
      // 3
      if (user.isDraft) {
        await this.userRepository.update({ id: user.id }, { isDraft: false, fullName })
      }
    }

    // 4
    const { accessToken, refreshToken } = await this.generateToken(user.id)

    // 5
    await this.userRepository.update({ id: user.id }, { refreshToken })

    return { accessToken, refreshToken }
  }
}
