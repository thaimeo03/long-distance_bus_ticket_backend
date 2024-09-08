import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { AuthStrategy } from './strategies/auth.strategy'
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy'
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule],
  providers: [AuthService, AuthStrategy, RefreshTokenStrategy],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
