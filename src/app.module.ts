import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.local' })],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
