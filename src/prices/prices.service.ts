import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Route } from 'src/routes/entities/route.entity'
import { Repository } from 'typeorm'
import { Price } from './entities/price.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { GetPriceByRouteStopDto } from './dto/get-price-by-route-stop.dto'

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(Route) private routeRepository: Repository<Route>,
    @InjectRepository(Price) private priceRepository: Repository<Price>,
    @InjectRepository(RouteStop) private routeStopRepository: Repository<RouteStop>
  ) {}

  async getPriceByRouteStops({ pickupStopId, dropOffStopId }: GetPriceByRouteStopDto) {
    const pickupStop = await this.routeStopRepository.findOneBy({ id: pickupStopId })
    const dropOffStop = await this.routeStopRepository.findOneBy({ id: dropOffStopId })

    let price = await this.priceRepository.findOneBy({
      startStop: pickupStop,
      endStop: dropOffStop
    })

    const route = await this.routeRepository.findOneBy({ routeStops: { id: pickupStopId } })

    if (!price) {
      price = await this.priceRepository.findOneBy({ route })
    }

    // Create by distance
    if (!price) {
      price = this.priceRepository.create({
        startStop: pickupStop,
        endStop: dropOffStop,
        route: route,
        price: (dropOffStop.distanceFromStartKm - pickupStop.distanceFromStartKm) * 1000
      })
    }

    return price
  }
}
