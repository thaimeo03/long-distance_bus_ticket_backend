import { Entity, JoinColumn, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, ManyToMany, JoinTable } from 'typeorm'
import { User } from 'src/users/entities/user.entity'
import { Schedule } from 'src/schedules/entities/schedule.entity'
import { Payment } from 'src/payments/entities/payment.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { Seat } from 'src/seats/entities/seat.entity'

@Entity('Bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'integer', nullable: true })
  quantity: number

  @Column({ type: 'timestamp', nullable: true })
  bookingDate: Date

  @ManyToOne(() => User, (user) => user.bookings)
  user: User

  @ManyToOne(() => Schedule, (schedule) => schedule.bookings)
  schedule: Schedule

  @ManyToMany(() => Seat)
  @JoinTable()
  seats: Seat[]

  @OneToOne(() => Payment, (payment) => payment.booking)
  @JoinColumn()
  payment: Payment

  @ManyToOne(() => RouteStop, (routeStop) => routeStop.pickUpStops)
  pickupStop: RouteStop

  @ManyToOne(() => RouteStop, (routeStop) => routeStop.dropOffStops)
  dropOffStop: RouteStop
}
