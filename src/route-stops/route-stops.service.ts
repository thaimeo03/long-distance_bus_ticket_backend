import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
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
    const [route, firstRouteStop] = await Promise.all([
      this.routeRepository.findOneBy({ id: createRouteStopDto.routeId }),
      this.routeStopRepository
        .createQueryBuilder('routeStop')
        .leftJoinAndSelect('routeStop.route', 'route')
        .where('routeStop.routeId = :routeId', { routeId: createRouteStopDto.routeId })
        .orderBy('routeStop.arrivalTime')
        .getOne()
    ])

    if (!route) throw new NotFoundException('Route not found')

    if (firstRouteStop) {
      const arrivalTime = new Date(createRouteStopDto.arrivalTime)
      const timestamp = new Date(firstRouteStop.arrivalTime).getTime() + route.durationHours * 60 * 60 * 1000

      if (timestamp < arrivalTime.getTime() || firstRouteStop.arrivalTime.getTime() > arrivalTime.getTime()) {
        throw new BadRequestException('Wrong arrival time')
      }
    }

    return await this.routeStopRepository.save({ ...createRouteStopDto, route })
  }

  async getRouteStops() {
    return await this.routeStopRepository.find()
  }
}
