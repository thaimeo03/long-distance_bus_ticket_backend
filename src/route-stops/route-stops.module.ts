import { Module } from '@nestjs/common'
import { RouteStopsController } from './route-stops.controller'
import { RouteStopsService } from './route-stops.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouteStop } from './entities/route-stop.entity'

@Module({
  imports: [TypeOrmModule.forFeature([RouteStop])],
  controllers: [RouteStopsController],
  providers: [RouteStopsService]
})
export class RouteStopsModule {}
