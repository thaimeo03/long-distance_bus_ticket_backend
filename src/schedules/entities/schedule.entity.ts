import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'
import { Booking } from 'src/bookings/entities/booking.entity'
import { Bus } from 'src/buses/entities/bus.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'

@Entity('Schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'timestamp', nullable: true })
  departureTime: Date

  @ManyToOne(() => RouteStop, (routeStop) => routeStop.schedules)
  routeStop: RouteStop

  @OneToMany(() => Booking, (booking) => booking.schedule)
  bookings: Booking[]

  @ManyToOne(() => Bus, (bus) => bus.schedules)
  bus: Bus
}
