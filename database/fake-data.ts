import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { Route } from 'src/routes/entities/route.entity'
import { Schedule } from 'src/schedules/entities/schedule.entity'
import { Repository } from 'typeorm'
import { fakerVI } from '@faker-js/faker'

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Route) private routeRepository: Repository<Route>,
    @InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>,
    @InjectRepository(RouteStop) private routeStopRepository: Repository<RouteStop>
  ) {}

  async seedData() {
    // seed routes
    const routes: Route[] = this.seedRoutes(2)

    // seed route stops
    // const routeStops: RouteStop[] = [
    //   // start location
    //   this.routeStopRepository.create({
    //     route: routes[0],
    //     location: 'Sân bay Nội Bài',
    //     arrivalTime: faker.date.past(),
    //     distanceFromStartKm: 0
    //   }),

    //   // middle location
    //   this.routeStopRepository.create({
    //     route: routes[0],
    //     location: '4 Thọ Tháp',
    //     arrivalTime: faker.date.recent(),
    //     distanceFromStartKm: 5
    //   }),

    //   this.routeStopRepository.create({
    //     route: routes[0],
    //     location: '43 Nguyễn Quốc Trí',
    //     arrivalTime: faker.date.recent(),
    //     distanceFromStartKm: 4
    //   }),

    //   // end location
    //   this.routeStopRepository.create({
    //     route: routes[0],
    //     location: '08A Vincom Shophouse Thái Bình',
    //     arrivalTime: faker.date.recent(),
    //     distanceFromStartKm: 100
    //   })
    // ]

    // seed schedules
    // const schedules: Schedule[] = [
    //   this.scheduleRepository.create({
    //     routeStop: routeStops[0],
    //     departureTime: faker.date.past()
    //   }),
    //   this.scheduleRepository.create({
    //     routeStop: routeStops[0],
    //     departureTime: faker.date.past()
    //   })
    // ]

    await this.routeRepository.save(routes)
    // await this.routeStopRepository.save(routeStops)
    // await this.scheduleRepository.save(schedules)
  }

  seedRoutes(quantity: number): Route[] {
    const routes: Route[] = []
    // two-way
    while (quantity--) {
      const startLocation = fakerVI.location.city()
      const endLocation = fakerVI.location.city()
      const distanceKm = fakerVI.number.int({ min: 100, max: 1000 })
      const durationHours = fakerVI.number.int({ min: 3, max: 30 })

      routes.push(
        this.routeRepository.create({
          startLocation: startLocation,
          endLocation: endLocation,
          distanceKm: distanceKm,
          durationHours: durationHours
        })
      )
      routes.push(
        this.routeRepository.create({
          startLocation: endLocation,
          endLocation: startLocation,
          distanceKm: distanceKm,
          durationHours: durationHours
        })
      )
    }

    return routes
  }
}
