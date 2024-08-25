import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm'
import { Booking } from 'src/bookings/entities/booking.entity'
import { Role, Sex } from 'common/enums/users.enum'

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  @Index({ unique: true })
  email: string

  @Column({ type: 'varchar' })
  phoneNumber: string

  @Column({ type: 'smallint' })
  age: number

  @Column()
  passwordHashed: string

  @Column({ type: 'text', nullable: true })
  refreshToken: string

  @Column({ type: 'enum', enum: Role, default: Role.Passenger })
  role: number

  @Column({ type: 'enum', enum: Sex, nullable: true })
  sex: Sex

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[]
}
