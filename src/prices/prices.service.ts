import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Route } from 'src/routes/entities/route.entity'
import { Repository } from 'typeorm'
import { Price } from './entities/price.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(Route) private routeRepository: Repository<Route>,
    @InjectRepository(Price) private priceRepository: Repository<Price>
  ) {}

  async getPriceByBooking({ pickupStop, dropOffStop }: { pickupStop: RouteStop; dropOffStop: RouteStop }) {
    let price = await this.priceRepository.findOneBy({
      startStop: pickupStop,
      endStop: dropOffStop
    })

    if (!price) {
      const route = await this.routeRepository.findOneBy({ routeStops: pickupStop })
      price = await this.priceRepository.findOneBy({ route })
    }

    if (!price) {
      throw new NotFoundException('Price not found')
    }

    return price
  }
}
