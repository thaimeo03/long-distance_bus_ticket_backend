import { Bus } from 'src/buses/entities/bus.entity'
import { Route } from 'src/routes/entities/route.entity'

export class GetAvailableScheduleDto {
  bus: Bus
  route: Route
  schedules: { id: string; departureTime: Date }[]
}
