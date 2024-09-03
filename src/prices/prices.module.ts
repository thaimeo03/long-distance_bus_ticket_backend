import { Module } from '@nestjs/common'
import { PricesService } from './prices.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Route } from 'src/routes/entities/route.entity'
import { Price } from './entities/price.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { PricesController } from './prices.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Route, Price, RouteStop])],
  providers: [PricesService],
  exports: [PricesService],
  controllers: [PricesController]
})
export class PricesModule {}
