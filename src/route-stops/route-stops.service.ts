import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RouteStop } from './entities/route-stop.entity'
import { Repository } from 'typeorm'
import { CreateRouteStopDto } from './dto/create-route-stop.dto'
import { Route } from 'src/routes/entities/route.entity'

@Injectable()
export class RouteStopsService {
  constructor(
    @InjectRepository(RouteStop) private routeStopRepository: Repository<RouteStop>,
    @InjectRepository(Route) private routeRepository: Repository<Route>
  ) {}

  async createRouteStop(createRouteStopDto: CreateRouteStopDto) {
    const route = await this.routeRepository.findOneBy({ id: createRouteStopDto.routeId })
    return await this.routeStopRepository.save({ ...createRouteStopDto, route })
  }

  async getRouteStops() {
    return await this.routeStopRepository.find()
  }
}
