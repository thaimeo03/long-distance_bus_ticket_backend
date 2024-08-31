import { Controller, Get } from '@nestjs/common'
import { RouteStopsService } from './route-stops.service'
import { ResponseData } from 'common/core/response-success.dto'

@Controller('route-stops')
export class RouteStopsController {
  constructor(private routeStopsService: RouteStopsService) {}

  @Get('')
  async getRouteStops() {
    const data = await this.routeStopsService.getRouteStops()
    return new ResponseData({ message: 'Get route stops successfully', data })
  }
}
