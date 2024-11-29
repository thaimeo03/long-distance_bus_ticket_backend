import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { Route } from 'src/routes/entities/route.entity'
import { Schedule } from 'src/schedules/entities/schedule.entity'
import { Repository } from 'typeorm'
import { fa, fakerVI, ro } from '@faker-js/faker'
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

    const ROUTES_QUANTITY = 5
    const BUS_COMPANIES_QUANTITY = 5
    const BUS_QUANTITY = 2

    // seed routes
    let routes: Route[] = await this.routeRepository.find()
    if (routes.length === 0) {
      routes = await this.seedRoutes(ROUTES_QUANTITY)
    }

    // seed route stops
    let routeStops: RouteStop[] = await this.routeStopRepository.find()
    if (routeStops.length === 0) {
      routeStops = await this.seedRouteStops(routes)
    }

    // seed bus companies
    let busCompanies: BusCompany[] = await this.busCompanyRepository.find()
    if (busCompanies.length === 0) {
      busCompanies = await this.seedBusCompanies(BUS_COMPANIES_QUANTITY)
    }

    // seed buses
    let buses: Bus[] = await this.busRepository.find()
    if (buses.length === 0) {
      buses = await this.seedBuses({ quantity: BUS_QUANTITY, companies: busCompanies })
    }

    // seed seats
    let seats: Seat[] = await this.seatRepository.find()
    if (seats.length === 0) {
      seats = await this.seedSeats(buses)
    }

    // seed schedules
    let schedules: Schedule[] = await this.scheduleRepository.find()
    if (schedules.length === 0) {
      schedules = await this.seedSchedules({ buses: buses, routes: routes })
    }

    // seed prices
    let prices: Price[] = await this.priceRepository.find()
    if (prices.length === 0) {
      prices = await this.seedPrices(routes)
    }

    this.logger.warn('Seeding data complete!')
  }

  async seedRoutes(quantity: number) {
    const routes: Route[] = []
    const startLocations = ['Thái Bình', 'Nam Định']
    const endLocations = ['Hà Nội']

    // two-way
    while (quantity--) {
      const startLocation = fakerVI.helpers.arrayElement(startLocations)
      const endLocation = fakerVI.helpers.arrayElement(endLocations)

      const existedRoute = await this.routeRepository.findOneBy({
        startLocation: startLocation,
        endLocation: endLocation
      })
      if (existedRoute || startLocation === endLocation) {
        quantity++
        continue
      }

      const distanceKm = fakerVI.number.int({ min: 100, max: 1000 })
      const durationHours = Number((distanceKm / 60).toFixed(2)) // 60 km per hour

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

    return await Promise.all(routes.map((route) => this.routeRepository.save(route)))
  }

  async seedRouteStops(routes: Route[]) {
    const routeStops: RouteStop[] = []
    const arrivalTimeStartDepartures = [
      new Date('2024-12-08 5:00:00'),
      new Date('2024-12-08 8:00:00'),
      new Date('2024-12-08 10:00:00'),
      new Date('2024-12-08 13:00:00'),
      new Date('2024-12-08 16:00:00'),
      new Date('2024-12-08 19:00:00'),
      new Date('2024-12-08 22:00:00')
    ]

    for (const route of routes) {
      // Start location
      const startLocationDeparture = fakerVI.location.streetAddress() + ', ' + route.startLocation
      const arrivalTimeStartDeparture = fakerVI.helpers.arrayElement(arrivalTimeStartDepartures)
      const quantityInBetween = fakerVI.number.int({ min: 1, max: 4 })

      routeStops.push(
        this.routeStopRepository.create({
          route: route,
          location: startLocationDeparture,
          arrivalTime: arrivalTimeStartDeparture,
          distanceFromStartKm: 0
        })
      )

      // Middle locations
      for (let i = 1; i < quantityInBetween; i++) {
        const distanceFromStartKm = Math.floor((i * route.distanceKm) / quantityInBetween)
        routeStops.push(
          this.routeStopRepository.create({
            route: route,
            location: fakerVI.location.streetAddress() + ', ' + fakerVI.location.state(),
            distanceFromStartKm: distanceFromStartKm,
            arrivalTime: new Date(
              arrivalTimeStartDeparture.getTime() + Math.floor(distanceFromStartKm / 60) * 60 * 1000
            )
          })
        )
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

    return await Promise.all(routeStops.map((routeStop) => this.routeStopRepository.save(routeStop)))
  }

  async seedBusCompanies(quantity: number) {
    const busCompanies: BusCompany[] = []

    while (quantity--) {
      busCompanies.push(
        this.busCompanyRepository.create({
          name: fakerVI.company.name(),
          mainImage: fakerVI.image.urlLoremFlickr({ category: 'business' })
        })
      )
    }

    return await Promise.all(busCompanies.map((busCompany) => this.busCompanyRepository.save(busCompany)))
  }

  async seedBuses({ quantity, companies }: { quantity: number; companies: BusCompany[] }) {
    const buses: Bus[] = []

    for (const company of companies) {
      for (let i = 1; i <= quantity; i++) {
        buses.push(
          this.busRepository.create({
            busNumber: fakerVI.vehicle.vrm(),
            name: 'Xe khách ' + fakerVI.word.noun(),
            status: i % 5 === 0 ? BusStatus.EnRoute : BusStatus.Ready,
            images: [
              fakerVI.image.urlLoremFlickr({ category: 'bus' }),
              fakerVI.image.urlLoremFlickr({ category: 'bus' }),
              fakerVI.image.urlLoremFlickr({ category: 'bus' })
            ],
            busCompany: company
          })
        )
      }
    }

    return await Promise.all(buses.map((bus) => this.busRepository.save(bus)))
  }

  async seedSeats(buses: Bus[]) {
    const seats: Seat[] = []
    const numberOfSeats: number[] = [16, 24, 28, 32, 40, 44, 45]

    for (const bus of buses) {
      const numberOfSeat = fakerVI.helpers.arrayElement(numberOfSeats)

      for (let i = 0; i < numberOfSeat; i++) {
        seats.push(
          this.seatRepository.create({
            seatNumber: i + 1,
            isAvailable: i % 5 === 0 ? false : true,
            bus: bus
          })
        )
      }
    }

    return await Promise.all(seats.map((seat) => this.seatRepository.save(seat)))
  }

  async seedSchedules({ buses, routes }: { buses: Bus[]; routes: Route[] }) {
    const schedules: Schedule[] = []

    for (const route of routes) {
      const routeStops = await this.routeStopRepository.find({
        where: { route: { id: route.id } },
        order: { distanceFromStartKm: 'ASC' }
      })

      if (buses.length === 0) break
      const bus = buses.shift()

      for (let i = 0; i < routeStops.length; i++) {
        if (i % 2 === 0) {
          schedules.push(
            this.scheduleRepository.create({
              departureTime: routeStops[i].arrivalTime,
              bus: bus,
              routeStop: routeStops[i]
            })
          )
        }
      }
    }

    return await Promise.all(schedules.map((schedule) => this.scheduleRepository.save(schedule)))
  }

  async seedPrices(routes: Route[]) {
    const prices: Price[] = []

    for (const route of routes) {
      const routeStops = await this.routeStopRepository.find({
        where: { route: { id: route.id } },
        order: { distanceFromStartKm: 'ASC' }
      })

      for (let i = 0; i < routeStops.length - 1; i++) {
        prices.push(
          this.priceRepository.create({
            route: route,
            startStop: routeStops[i],
            endStop: routeStops[i + 1],
            price: fakerVI.number.int({ min: 50000, max: 100000 })
          })
        )
      }
    }

    return await Promise.all(prices.map((price) => this.priceRepository.save(price)))
  }
}
