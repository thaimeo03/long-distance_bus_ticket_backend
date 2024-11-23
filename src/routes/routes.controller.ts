import { Body, Controller, Post } from '@nestjs/common'
import { RoutesService } from './routes.service'
import { CreateRouteDetailsDto } from './dto/create-route-details.dto'
import { ResponseData } from 'common/core/response-success.dto'

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Post('details')
  async createRouteDetails(@Body() createRouteDetailsDto: CreateRouteDetailsDto) {
    const data = await this.routesService.createRouteDetails(createRouteDetailsDto)

    return new ResponseData({ message: 'Create route successfully', data })
  }
}
