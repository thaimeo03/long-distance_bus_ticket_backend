import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { Route } from 'src/routes/entities/route.entity'
import { Schedule } from 'src/schedules/entities/schedule.entity'
import { Repository } from 'typeorm'
import { fakerVI } from '@faker-js/faker'

@Injectable()
export class DataService {
  private logger: Logger = new Logger(DataService.name)

  constructor(
    @InjectRepository(Route) private routeRepository: Repository<Route>,
    @InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>,
    @InjectRepository(RouteStop) private routeStopRepository: Repository<RouteStop>
  ) {}

  async seedData() {
    this.logger.warn('Seeding data...')

    // const routes: Route[] = await this.routeRepository.save(this.seedRoutes(2))
    // const routeStops: RouteStop[] = await this.routeStopRepository.save(
    //   this.seedRouteStops({ quantityInBetween: 1, routes: routes })
    // )

    this.logger.warn('Seeding data complete!')
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

  seedRouteStops({ quantityInBetween, routes }: { quantityInBetween: number; routes: Route[] }): RouteStop[] {
    const routeStops: RouteStop[] = []

    for (const route of routes) {
      // Start location
      const startLocationDeparture = fakerVI.location.streetAddress() + ', ' + route.startLocation
      const arrivalTimeStartDeparture = fakerVI.date.future()
      routeStops.push(
        this.routeStopRepository.create({
          route: route,
          location: startLocationDeparture,
          arrivalTime: arrivalTimeStartDeparture,
          distanceFromStartKm: 0
        })
      )

      // Middle locations
      const middleLocations: string[] = []
      let quantity = quantityInBetween,
        countTime = 1,
        distance = quantityInBetween

      while (quantity--) {
        const middleLocation = fakerVI.location.streetAddress() + ', ' + fakerVI.location.city()
        const moreDistance = fakerVI.number.int({ min: 1, max: 10 })

        middleLocations.push(middleLocation)

        routeStops.push(
          this.routeStopRepository.create({
            route: route,
            location: middleLocation,
            arrivalTime: new Date(arrivalTimeStartDeparture.getTime() + 60 * 60 * 1000 * countTime++),
            distanceFromStartKm: distance + moreDistance
          })
        )

        distance += moreDistance
      }

      // End location
      const endLocationDeparture = fakerVI.location.streetAddress() + ', ' + route.endLocation
      const arrivalTimeEndDeparture = new Date(arrivalTimeStartDeparture.getTime() + 60 * 60 * 1000 * countTime++)

      routeStops.push(
        this.routeStopRepository.create({
          route: route,
          location: endLocationDeparture,
          arrivalTime: arrivalTimeEndDeparture,
          distanceFromStartKm: route.distanceKm
        })
      )
    }

    return routeStops
  }
}
