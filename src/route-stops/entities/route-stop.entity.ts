import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'
import { Schedule } from 'src/schedules/entities/schedule.entity'
import { Route } from 'src/routes/entities/route.entity'
import { Booking } from 'src/bookings/entities/booking.entity'
import { Price } from 'src/prices/entities/price.entity'

@Entity('Route_Stops')
export class RouteStop {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  location: string

  @Column({ type: 'integer' })
  distanceFromStartKm: number

  @Column({ type: 'timestamp' })
  arrivalTime: Date

  @OneToMany(() => Schedule, (schedule) => schedule.routeStop)
  schedules: Schedule[]

  @ManyToOne(() => Route, (route) => route.routeStops)
  route: Route

  @OneToMany(() => Booking, (booking) => booking.pickupStop)
  pickUpStops: Booking[]

  @OneToMany(() => Booking, (booking) => booking.dropOffStop)
  dropOffStops: Booking[]

  @OneToMany(() => Price, (price) => price.startStop)
  prices: Price[]

  @OneToMany(() => Price, (price) => price.endStop)
  endPrices: Price[]
}
