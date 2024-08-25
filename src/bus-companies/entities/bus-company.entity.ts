import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Bus } from 'src/buses/entities/bus.entity'

@Entity('Bus_Companies')
export class BusCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'text', nullable: true })
  mainImage: string

  @OneToMany(() => Bus, (bus) => bus.busCompany)
  buses: Bus[]
}
