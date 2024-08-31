import { Body, Controller, Get, Query } from '@nestjs/common'
import { SchedulesService } from './schedules.service'
import { ResponseData } from 'common/core/response-success.dto'
import { FindSchedulesDto } from './dto/find-schedules.dto'

@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Get('find')
  async findSchedules(@Query() findSchedulesDto: FindSchedulesDto) {
    const data = await this.schedulesService.findSchedules(findSchedulesDto)

    return new ResponseData({
      message: 'Find schedules successfully',
      data
    })
  }

  @Get('all/available')
  async getAllAvailableSchedules() {
    const data = await this.schedulesService.getAllAvailableSchedules()

    return new ResponseData({
      message: 'Get all available schedules successfully',
      data
    })
  }
}
