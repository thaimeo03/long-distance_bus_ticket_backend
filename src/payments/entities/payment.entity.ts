import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm'
import { Booking } from 'src/bookings/entities/booking.entity'
import { PaymentMethod } from 'common/enums/payments.enum'

@Entity('Payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  sessionId: string

  @Column({ type: 'boolean', default: false })
  paymentStatus: boolean

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  method: number

  @Column({ type: 'bigint' })
  amount: number

  @Column({ type: 'date', nullable: true })
  paymentDate: Date

  @OneToOne(() => Booking, (booking) => booking.payment)
  booking: Booking
}
