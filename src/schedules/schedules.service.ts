import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Schedule } from './entities/schedule.entity'
import { Repository } from 'typeorm'
import { BusStatus } from 'common/enums/buses.enum'
import { GetAvailableScheduleDto } from './dto/get-available-schedule.dto'
import { FindSchedulesDto } from './dto/find-schedules.dto'

@Injectable()
export class SchedulesService {
  constructor(@InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>) {}

  // Find schedules by pickup location, drop off location, and departure date
  // 1. Find all schedules having matching requirements
  async findSchedules(findSchedulesDto: FindSchedulesDto): Promise<GetAvailableScheduleDto[]> {
    const schedulesMatching: GetAvailableScheduleDto[] = []
    const map: Map<string, boolean> = new Map()

    const qb = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.routeStop', 'routeStop')
      .innerJoinAndSelect('routeStop.route', 'route')
      .innerJoinAndSelect('schedule.bus', 'bus')
      .innerJoinAndSelect('bus.seats', 'seats')
      .innerJoinAndSelect('route.routeStops', 'routeStops')
      .innerJoinAndSelect('route.prices', 'prices')
      .innerJoinAndSelect('bus.busCompany', 'busCompany')
      .where('bus.status = :status', { status: BusStatus.Ready })
      .andWhere('LOWER(route.startLocation) LIKE LOWER(:pickupLocation)', {
        pickupLocation: `%${findSchedulesDto.pickupLocation}%`
      })
      .andWhere('LOWER(route.endLocation) LIKE LOWER(:dropOffLocation)', {
        dropOffLocation: `%${findSchedulesDto.dropOffLocation}%`
      })
      // .andWhere('DATE(schedule.departureTime) = DATE(:departureDate)', { departureDate: findSchedulesDto.departureDate })
      .orderBy('routeStops.distanceFromStartKm', 'ASC')

    const allSchedules = await qb.getMany()

    for (const schedule of allSchedules) {
      const key = `${schedule.bus.busNumber}-${schedule.routeStop.route.startLocation}-${schedule.routeStop.route.endLocation}`

      if (!map.has(key)) {
        schedulesMatching.push({
          bus: schedule.bus,
          route: schedule.routeStop.route,
          schedules: [
            {
              id: schedule.id,
              departureTime: schedule.departureTime
            }
          ]
        })

        map.set(key, true)
      }
    }

    return schedulesMatching
  }

  // Join route, bus, routeStop, prices
  async getAllAvailableSchedules() {
    const schedules = await this.scheduleRepository.find({
      relations: ['routeStop.route.routeStops', 'bus.busCompany', 'routeStop.route.prices', 'bus.seats'],
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

      groupedData.get(key).bus.seats = schedule.bus.seats.sort((a, b) => a.seatNumber - b.seatNumber)
    })

    return Array.from(groupedData.values())
  }
}
