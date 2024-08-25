import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Route } from 'src/routes/entities/route.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'

@Entity('Prices')
export class Price {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'bigint' })
  price: number

  @ManyToOne(() => Route, (route) => route.prices)
  route: Route

  @ManyToOne(() => RouteStop, (routeStop) => routeStop.prices)
  startStop: RouteStop

  @ManyToOne(() => RouteStop, (routeStop) => routeStop.prices)
  endStop: RouteStop
}
