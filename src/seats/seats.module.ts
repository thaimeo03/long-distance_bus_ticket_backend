import { Module } from '@nestjs/common'
import { SeatsService } from './seats.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Seat } from './entities/seat.entity'
import { BusesModule } from 'src/buses/buses.module'
import { Bus } from 'src/buses/entities/bus.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Seat, Bus])],
  providers: [SeatsService],
  exports: [SeatsService]
})
export class SeatsModule {}
