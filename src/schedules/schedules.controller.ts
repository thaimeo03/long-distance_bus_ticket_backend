import { Controller, Get } from '@nestjs/common'
import { SchedulesService } from './schedules.service'

@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Get('all/available')
  async getAllAvailableSchedules() {
    return this.schedulesService.getAllAvailableSchedules()
  }
}
