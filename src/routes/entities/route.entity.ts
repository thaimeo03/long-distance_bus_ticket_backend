import { Price } from 'src/prices/entities/price.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'

@Entity('Routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', nullable: true })
  startLocation: string

  @Column({ type: 'varchar', nullable: true })
  endLocation: string

  @Column({ type: 'integer', nullable: true })
  distanceKm: number

  @Column({ type: 'float', nullable: true })
  durationHours: number

  @OneToMany(() => RouteStop, (routeStop) => routeStop.route)
  routeStops: RouteStop[]

  @OneToMany(() => Price, (price) => price.route)
  prices: Price[]
}
