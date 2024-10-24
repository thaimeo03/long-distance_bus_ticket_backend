import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Schedule } from './entities/schedule.entity'
import { Repository } from 'typeorm'
import { BusStatus } from 'common/enums/buses.enum'
import { GetAvailableScheduleDto } from './dto/get-available-schedule.dto'
import { FindSchedulesDto } from './dto/find-schedules.dto'
import { FilterSchedulesDto, IPeriodTime } from './dto/filter-schedules.dto'
import { convertToDateTimeRange } from 'common/utils/convert.util'
import { ScheduleSortBy, ScheduleSortOrder } from 'common/enums/schedules.enum'

@Injectable()
export class SchedulesService {
  constructor(@InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>) {}

  // 1. Find all schedules having matching requirements
  // 2. Sort schedules
  // 3. Filter out schedules that have matched findSchedulesDto
  async findSchedules({
    findSchedulesDto,
    filterSchedulesDto
  }: {
    findSchedulesDto: FindSchedulesDto
    filterSchedulesDto: FilterSchedulesDto
  }): Promise<GetAvailableScheduleDto[]> {
    const schedulesMatching: GetAvailableScheduleDto[] = []
    const map: Map<string, boolean> = new Map()

    const qb = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.routeStop', 'routeStop')
      .innerJoinAndSelect('routeStop.route', 'route')
      .innerJoinAndSelect('schedule.bus', 'bus')
      .innerJoinAndSelect('bus.seats', 'seats')
      .innerJoinAndSelect('route.routeStops', 'pickupStop')
      .innerJoinAndSelect('route.routeStops', 'dropOffStop')
      .innerJoinAndSelect('route.routeStops', 'routeStops')
      .innerJoinAndSelect('route.prices', 'prices')
      .innerJoinAndSelect('bus.busCompany', 'busCompany')
      .where('bus.status = :status', { status: BusStatus.Ready })
      .andWhere('pickupStop.location ILIKE :pickupLocation', {
        pickupLocation: `%${findSchedulesDto.pickupLocation.toLowerCase()}%`
      })
      .andWhere('dropOffStop.location ILIKE :dropOffLocation', {
        dropOffLocation: `%${findSchedulesDto.dropOffLocation.toLowerCase()}%`
      })
      .andWhere('pickupStop.distanceFromStartKm < dropOffStop.distanceFromStartKm') // Ensure pickup is before drop-off
      .andWhere('DATE(schedule.departureTime) = DATE(:departureDate)', {
        departureDate: findSchedulesDto.departureDate
      })
      .orderBy('routeStops.distanceFromStartKm', 'ASC')
      .addOrderBy('schedule.departureTime', 'ASC')
      .addOrderBy('prices.price', 'ASC')
      .addOrderBy('seats.seatNumber', 'ASC')

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

    const filteredSchedulesMatching = this.filterSchedules(schedulesMatching, filterSchedulesDto)

    return filteredSchedulesMatching
  }

  async filterSchedules(
    schedulesMatching: GetAvailableScheduleDto[],
    filterSchedulesDto: FilterSchedulesDto
  ): Promise<GetAvailableScheduleDto[]> {
    const { periodDepartures, periodArrivals, sortBy, sortOrder, companyIds } = filterSchedulesDto

    // Filter
    const res = schedulesMatching.filter((schedule) => {
      const conditions: boolean[] = []
      // Check if departure schedule is in time range
      if (periodDepartures)
        conditions.push(
          this.isInDateTimeRange({
            dateTime: schedule.schedules[0].departureTime,
            periods: periodDepartures
          })
        )
      // Check if arrival schedule is in time range
      if (periodArrivals)
        conditions.push(
          this.isInDateTimeRange({
            dateTime: new Date(
              schedule.schedules[0].departureTime.getTime() + schedule.route.durationHours * 60 * 60 * 1000
            ),
            periods: periodArrivals
          })
        )
      // Check company id
      if (companyIds) conditions.push(companyIds.includes(schedule.bus.busCompany.id))

      // Check if all conditions are true
      if (conditions.every((condition) => condition)) {
        return true
      }
    })

    // Sort
    if (sortBy === undefined) return res
    const isSortDesc = sortOrder === ScheduleSortOrder.Ascending ? 1 : -1

    res.sort((s1, s2) => {
      const getValue = (schedule: GetAvailableScheduleDto) => {
        switch (sortBy) {
          case ScheduleSortBy.DepartureTime:
            return schedule.schedules[0].departureTime.getTime()
          case ScheduleSortBy.ArrivalTime:
            return schedule.schedules[0].departureTime.getTime() + schedule.route.durationHours * 60 * 60 * 1000
          case ScheduleSortBy.SeatsAvailable:
            return schedule.bus.seats.length
          case ScheduleSortBy.Price:
            return schedule.route.prices[0].price
        }
      }

      return (getValue(s1) - getValue(s2)) * isSortDesc
    })

    return res
  }

  isInDateTimeRange({ dateTime, periods }: { dateTime: Date; periods: IPeriodTime[] }): boolean {
    if (!periods) return true
    const convertedPeriodDepartures = periods.map((period) => {
      const { startDateTime, endDateTime } = convertToDateTimeRange(dateTime, period.startTime, period.endTime)
      return { startDateTime, endDateTime }
    })

    return convertedPeriodDepartures.some(({ startDateTime, endDateTime }) => {
      return startDateTime <= dateTime && dateTime <= endDateTime
    })
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
