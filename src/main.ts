import { BaseExceptionFilter, HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const { httpAdapter } = app.get(HttpAdapterHost)
  const port = configService.get('PORT') || 3000

  app.useGlobalPipes(new ValidationPipe()) // Validation pipe is global
  app.useGlobalFilters(new BaseExceptionFilter(httpAdapter)) // Exception filter is global
  app.enableCors()

  await app.listen(port)
}
bootstrap()
