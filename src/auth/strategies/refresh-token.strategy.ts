import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { Request } from 'express'
import { Strategy } from 'passport-jwt'
import { User } from 'src/users/entities/user.entity'
import { Repository } from 'typeorm'

interface IJwtPayload {
  userId: string
  type: string
  iat: number
  exp: number
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  @InjectRepository(User) private userRepository: Repository<User>

  constructor() {
    super({
      jwtFromRequest: RefreshTokenStrategy.extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET
    })
  }

  private static extractJwtFromCookie(req: Request) {
    if (req.cookies && 'refresh_token' in req.cookies) {
      return req.cookies.refresh_token
    }
    return null
  }

  async validate(payload: IJwtPayload) {
    const user = await this.userRepository.findOneBy({ id: payload.userId })

    if (!user) return null

    return {
      userId: user.id,
      role: user.role
    }
  }
}
