import { Controller, Get } from '@nestjs/common'
import { BusCompaniesService } from './bus-companies.service'
import { ResponseData } from 'common/core/response-success.dto'

@Controller('bus-companies')
export class BusCompaniesController {
  constructor(private busCompaniesService: BusCompaniesService) {}

  @Get()
  async findAll() {
    const data = await this.busCompaniesService.findAll()

    return new ResponseData({ message: 'Get bus companies successfully', data })
  }
}
