import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Schedule } from './entities/schedule.entity'
import { Repository } from 'typeorm'
import { BusStatus } from 'common/enums/buses.enum'
import { GetAvailableScheduleDto } from './dto/get-available-schedule.dto'

@Injectable()
export class SchedulesService {
  constructor(@InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>) {}

  // Join route, bus, routeStop, prices
  async getAllAvailableSchedules() {
    const schedules = await this.scheduleRepository.find({
      relations: ['routeStop.route.routeStops', 'bus.busCompany', 'routeStop.route.prices'],
      where: { bus: { status: BusStatus.Ready } },
      order: { departureTime: 'ASC' }
    })

    const groupedData: Map<string, GetAvailableScheduleDto> = new Map()
    schedules.forEach((schedule) => {
      const key = `${schedule.bus.busNumber}-${schedule.routeStop.route.startLocation}-${schedule.routeStop.route.endLocation}`

      schedule.routeStop.route.routeStops = schedule.routeStop.route.routeStops.sort(
        (a, b) => a.distanceFromStartKm - b.distanceFromStartKm
      )

      if (!groupedData.has(key)) {
        groupedData.set(key, {
          bus: schedule.bus,
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
