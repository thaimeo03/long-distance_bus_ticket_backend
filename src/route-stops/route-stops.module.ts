import { Module } from '@nestjs/common'
import { RouteStopsController } from './route-stops.controller'
import { RouteStopsService } from './route-stops.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouteStop } from './entities/route-stop.entity'
import { Route } from 'src/routes/entities/route.entity'

@Module({
  imports: [TypeOrmModule.forFeature([RouteStop, Route])],
  controllers: [RouteStopsController],
  providers: [RouteStopsService],
  exports: [RouteStopsService]
})
export class RouteStopsModule {}
