import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UsersController } from './users.controller'
import { AuthModule } from 'src/auth/auth.module'
import { CacheModule } from '@nestjs/cache-manager'
import { MailsModule } from 'src/mails/mails.module'

@Module({
  imports: [TypeOrmModule.forFeature([User]), CacheModule.register(), AuthModule, MailsModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
