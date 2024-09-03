import { Controller, Get, Query } from '@nestjs/common'
import { PricesService } from './prices.service'
import { GetPriceByRouteStopDto } from './dto/get-price-by-route-stop.dto'
import { ResponseData } from 'common/core/response-success.dto'

@Controller('prices')
export class PricesController {
  constructor(private pricesService: PricesService) {}

  @Get()
  async getPriceByRouteStops(@Query() getPriceByRouteStopsDto: GetPriceByRouteStopDto) {
    const data = await this.pricesService.getPriceByRouteStops(getPriceByRouteStopsDto)

    return new ResponseData({
      message: 'Get price by route stops successfully',
      data
    })
  }
}
