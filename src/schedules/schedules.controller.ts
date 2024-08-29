import { Controller, Get } from '@nestjs/common'
import { SchedulesService } from './schedules.service'
import { ResponseData } from 'common/core/response-success.dto'

@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Get('all/available')
  async getAllAvailableSchedules() {
    const data = await this.schedulesService.getAllAvailableSchedules()

    return new ResponseData({
      message: 'Get all available schedules successfully',
      data
    })
  }
}
