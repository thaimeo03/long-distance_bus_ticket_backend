import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RouteStop } from './entities/route-stop.entity'
import { Repository } from 'typeorm'

@Injectable()
export class RouteStopsService {
  constructor(@InjectRepository(RouteStop) private routeStopRepository: Repository<RouteStop>) {}

  async getRouteStops() {
    return await this.routeStopRepository.find()
  }
}
