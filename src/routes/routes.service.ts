import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Route } from './entities/route.entity'
import { CreateRouteDto } from './dto/create-route.dto'
import { CreateRouteDetailsDto } from './dto/create-route-details.dto'
import { RouteStopsService } from 'src/route-stops/route-stops.service'
import { PricesService } from 'src/prices/prices.service'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route) private routeRepository: Repository<Route>,
    private routeStopsService: RouteStopsService,
    private pricesService: PricesService
  ) {}

  async createRoute(createRouteDto: CreateRouteDto) {
    return this.routeRepository.save(createRouteDto)
  }

  async createRouteDetails(createRouteDetailsDto: CreateRouteDetailsDto) {
    const { startLocation, endLocation, distanceKm, durationHours, routeStops } = createRouteDetailsDto

    const route = await this.createRoute({
      startLocation,
      endLocation,
      distanceKm,
      durationHours
    })

    const createdRouteStops: RouteStop[] = []

    for (const routeStop of routeStops) {
      createdRouteStops.push(await this.routeStopsService.createRouteStop({ ...routeStop, routeId: route.id }))
    }

    const sortedRouteStops = createdRouteStops.sort((a, b) => a.distanceFromStartKm - b.distanceFromStartKm)

    for (let i = 0; i < sortedRouteStops.length - 1; i++) {
      for (let j = i + 1; j < sortedRouteStops.length; j++) {
        await this.pricesService.createPrice({
          routeId: route.id,
          startStopId: sortedRouteStops[i].id,
          endStopId: sortedRouteStops[j].id
        })
      }
    }
  }
}
