import { Module } from '@nestjs/common'
import { RoutesController } from './routes.controller'
import { RoutesService } from './routes.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Route } from './entities/route.entity'
import { RouteStopsModule } from 'src/route-stops/route-stops.module'
import { PricesModule } from 'src/prices/prices.module'

@Module({
  imports: [TypeOrmModule.forFeature([Route]), RouteStopsModule, PricesModule],
  controllers: [RoutesController],
  providers: [RoutesService]
})
export class RoutesModule {}
