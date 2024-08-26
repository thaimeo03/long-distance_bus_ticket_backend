import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Schedule } from './entities/schedule.entity'
import { Repository } from 'typeorm'
import { BusStatus } from 'common/enums/buses.enum'

@Injectable()
export class SchedulesService {
  constructor(@InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>) {}

  async getAllAvailableSchedules() {
    const schedules = await this.scheduleRepository.find({
      relations: ['routeStop.route.routeStops', 'bus'],
      where: { bus: { status: BusStatus.Ready } },
      order: { departureTime: 'ASC' }
    })

    const groupedData: Map<string, any> = new Map()
    schedules.forEach((schedule) => {
      const key = `${schedule.bus.busNumber}-${schedule.routeStop.route.startLocation}-${schedule.routeStop.route.endLocation}`

      if (!groupedData.has(key)) {
        groupedData.set(key, {
          busNumber: schedule.bus.busNumber,
          busName: schedule.bus.name,
          route: schedule.routeStop.route,
          schedules: []
        })
      }

      groupedData.get(key).schedules.push({
        id: schedule.id,
        departureTime: schedule.departureTime
      })
    })

    return Array.from(groupedData.values())
  }
}
