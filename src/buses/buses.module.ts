import { Module } from '@nestjs/common'
import { BusesService } from './buses.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bus } from './entities/bus.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Bus])],
  providers: [BusesService],
  exports: [BusesService]
})
export class BusesModule {}
