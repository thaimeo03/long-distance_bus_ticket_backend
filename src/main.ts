import { BaseExceptionFilter, HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { DataService } from 'database/fake-data'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const { httpAdapter } = app.get(HttpAdapterHost)
  const port = configService.get('PORT') || 9999

  app.useGlobalPipes(new ValidationPipe({ transform: true })) // Validation pipe is global
  app.useGlobalFilters(new BaseExceptionFilter(httpAdapter)) // Exception filter is global
  app.use(cookieParser()) // // Add cookie parser
  app.enableCors({ origin: [configService.get('CLIENT_URL')], credentials: true }) // Enable CORS

  // For seeding data
  // const dataService = app.get(DataService)
  // await dataService.seedData()

  await app.listen(port)
}
bootstrap()
