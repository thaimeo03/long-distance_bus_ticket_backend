import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Bus } from 'src/buses/entities/bus.entity'
import { Booking } from 'src/bookings/entities/booking.entity'

@Entity('Seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'smallint', unique: true })
  seatNumber: number

  @Column({ type: 'boolean', nullable: true })
  isAvailable: boolean

  @ManyToOne(() => Bus, (bus) => bus.seats)
  bus: Bus

  @ManyToOne(() => Booking, (booking) => booking.seats)
  booking: Booking
}
