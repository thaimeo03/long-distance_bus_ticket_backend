import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { AuthStrategy } from './strategies/auth.strategy'
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy'
import { AuthController } from './auth.controller'
import { GoogleStrategy } from './strategies/google.strategy'

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule],
  providers: [AuthService, AuthStrategy, RefreshTokenStrategy, GoogleStrategy],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
