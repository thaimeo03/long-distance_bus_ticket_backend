import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Schedule } from './entities/schedule.entity'
import { Repository } from 'typeorm'

@Injectable()
export class SchedulesService {
  constructor(@InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>) {}

  async getAllAvailableSchedules() {
    return await this.scheduleRepository.find({
      relations: ['routeStop.route', 'bookings', 'bus']
    })
  }
}
