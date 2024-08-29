import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { Route } from 'src/routes/entities/route.entity'
import { Schedule } from 'src/schedules/entities/schedule.entity'
import { Repository } from 'typeorm'
import { fakerVI } from '@faker-js/faker'
import { BusCompany } from 'src/bus-companies/entities/bus-company.entity'
import { Bus } from 'src/buses/entities/bus.entity'
import { Seat } from 'src/seats/entities/seat.entity'
import { BusStatus } from 'common/enums/buses.enum'
import { Price } from 'src/prices/entities/price.entity'

@Injectable()
export class DataService {
  private logger: Logger = new Logger(DataService.name)

  constructor(
    @InjectRepository(BusCompany) private busCompanyRepository: Repository<BusCompany>,
    @InjectRepository(Bus) private busRepository: Repository<Bus>,
    @InjectRepository(Seat) private seatRepository: Repository<Seat>,
    @InjectRepository(Route) private routeRepository: Repository<Route>,
    @InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>,
    @InjectRepository(RouteStop) private routeStopRepository: Repository<RouteStop>,
    @InjectRepository(Price) private priceRepository: Repository<Price>
  ) {}

  async seedData() {
    this.logger.warn('Seeding data...')

    const ROUTES_QUANTITY = 10
    const QUANTITY_IN_BETWEEN_OF_ROUTE_STOPS = 1
    const BUS_COMPANIES_QUANTITY = 5
    const BUS_QUANTITY = 5

    // // seed routes
    const routes: Route[] = await this.routeRepository.find()
    if (!routes.length) {
      routes.push(...(await this.routeRepository.save(this.seedRoutes(ROUTES_QUANTITY))))
    }

    // // seed route stops
    const routeStops: RouteStop[] = await this.routeStopRepository.find()
    if (!routeStops.length) {
      routeStops.push(
        ...(await this.routeStopRepository.save(
          this.seedRouteStops({ quantityInBetween: QUANTITY_IN_BETWEEN_OF_ROUTE_STOPS, routes: routes })
        ))
      )
    }

    // seed companies
    const companies: BusCompany[] = await this.busCompanyRepository.find()
    if (!companies.length) {
      companies.push(...(await this.busCompanyRepository.save(this.seedBusCompanies(BUS_COMPANIES_QUANTITY))))
    }

    // seed buses
    const buses: Bus[] = await this.busRepository.find()
    if (!buses.length) {
      buses.push(...(await this.busRepository.save(this.seedBuses({ quantity: BUS_QUANTITY, companies: companies }))))
    }

    // seed seats
    const seats: Seat[] = await this.seatRepository.find()
    if (!seats.length) {
      seats.push(...(await this.seatRepository.save(this.seedSeats(buses))))
    }

    // seed schedules
    const schedules: Schedule[] = await this.scheduleRepository.find()
    if (!schedules.length) {
      schedules.push(
        ...(await this.scheduleRepository.save(
          this.seedSchedules({
            buses: buses,
            routeStops: routeStops,
            quantityInBetweenRoute: QUANTITY_IN_BETWEEN_OF_ROUTE_STOPS
          })
        ))
      )
    }

    // seed prices
    const prices: Price[] = await this.priceRepository.find()
    if (!prices.length) {
      prices.push(
        ...(await this.priceRepository.save(
          this.seedPrices({
            routes: routes,
            routeStops: routeStops,
            quantityInBetweenRoute: QUANTITY_IN_BETWEEN_OF_ROUTE_STOPS
          })
        ))
      )
    }

    this.logger.warn('Seeding data complete!')
  }

  seedRoutes(quantity: number): Route[] {
    const routes: Route[] = []
    // two-way
    while (quantity--) {
      const startLocation = fakerVI.location.state()
      const endLocation = fakerVI.location.state()
      const distanceKm = fakerVI.number.int({ min: 100, max: 1000 })
      const durationHours = fakerVI.number.int({ min: 3, max: 10 })

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
        const middleLocation = fakerVI.location.streetAddress() + ', ' + fakerVI.location.state()
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
      const arrivalTimeEndDeparture = new Date(
        arrivalTimeStartDeparture.getTime() + route.durationHours * 60 * 60 * 1000
      )

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

  seedBusCompanies(quantity: number): BusCompany[] {
    const busCompanies: BusCompany[] = []

    while (quantity--) {
      busCompanies.push(
        this.busCompanyRepository.create({
          name: fakerVI.company.name(),
          mainImage: fakerVI.image.url()
        })
      )
    }

    return busCompanies
  }

  seedBuses({ quantity, companies }: { quantity: number; companies: BusCompany[] }): Bus[] {
    const buses: Bus[] = []

    for (const company of companies) {
      let count = quantity
      while (count--) {
        buses.push(
          this.busRepository.create({
            busNumber: fakerVI.vehicle.vrm(),
            name: 'Xe khách ' + fakerVI.word.noun(),
            status: count % 5 === 0 ? BusStatus.EnRoute : BusStatus.Ready,
            images: [fakerVI.image.url(), fakerVI.image.url(), fakerVI.image.url()],
            busCompany: company
          })
        )
      }
    }

    return buses
  }

  seedSeats(buses: Bus[]): Seat[] {
    const seats: Seat[] = []
    const numberOfSeats: number[] = [16, 24, 28, 32, 40, 44, 45, 46]

    for (const bus of buses) {
      const numberOfSeat = numberOfSeats[Math.floor(Math.random() * numberOfSeats.length)]

      for (let i = 0; i < numberOfSeat; i++) {
        seats.push(
          this.seatRepository.create({
            seatNumber: i + 1,
            isAvailable: i % 4 === 0 ? false : true,
            bus: bus
          })
        )
      }
    }

    return seats
  }

  seedSchedules({
    buses,
    routeStops,
    quantityInBetweenRoute
  }: {
    buses: Bus[]
    routeStops: RouteStop[]
    quantityInBetweenRoute: number
  }): Schedule[] {
    const schedules: Schedule[] = []
    const pivot = quantityInBetweenRoute + 2
    let i = 0

    for (const bus of buses) {
      if (i >= routeStops.length) break

      while (i < routeStops.length) {
        // Departure direction
        schedules.push(
          this.scheduleRepository.create({
            bus: bus,
            departureTime: routeStops[i].arrivalTime,
            routeStop: routeStops[i]
          })
        )

        // Arrival direction
        schedules.push(
          this.scheduleRepository.create({
            bus: bus,
            departureTime: new Date(
              routeStops[i + pivot - 1].arrivalTime.getTime() + 60 * 60 * 1000 * quantityInBetweenRoute
            ),
            routeStop: routeStops[i + pivot - 1]
          })
        )

        i += pivot
        break
      }
    }

    return schedules
  }

  seedPrices({
    routes,
    routeStops,
    quantityInBetweenRoute
  }: {
    routes: Route[]
    routeStops: RouteStop[]
    quantityInBetweenRoute: number
  }): Price[] {
    const prices: Price[] = []
    const pivot = quantityInBetweenRoute + 2
    let i = 0

    for (const route of routes) {
      const startStop = routeStops[i]
      const endStop = routeStops[i + pivot - 1]
      i += pivot

      prices.push(
        this.priceRepository.create({
          price: fakerVI.number.int({ min: 100000, max: 1000000 }),
          route: route,
          startStop: startStop,
          endStop: endStop
        })
      )
    }

    return prices
  }
}
