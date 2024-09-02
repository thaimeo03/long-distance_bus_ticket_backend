import { Module } from '@nestjs/common'
import { PricesService } from './prices.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Route } from 'src/routes/entities/route.entity'
import { Price } from './entities/price.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Route, Price])],
  providers: [PricesService],
  exports: [PricesService]
})
export class PricesModule {}
