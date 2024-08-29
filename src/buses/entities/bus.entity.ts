import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'
import { BusCompany } from 'src/bus-companies/entities/bus-company.entity'
import { Seat } from 'src/seats/entities/seat.entity'
import { BusStatus } from 'common/enums/buses.enum'
import { Schedule } from 'src/schedules/entities/schedule.entity'

@Entity('Buses')
export class Bus {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true })
  busNumber: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'enum', enum: BusStatus, default: BusStatus.Ready })
  status: BusStatus

  @Column({ type: 'varchar', array: true })
  images: string[]

  @ManyToOne(() => BusCompany, (busCompany) => busCompany.buses)
  busCompany: BusCompany

  @OneToMany(() => Seat, (seat) => seat.bus)
  seats: Seat[]

  @OneToMany(() => Schedule, (schedule) => schedule.bus)
  schedules: Schedule[]
}
