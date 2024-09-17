import { Module } from '@nestjs/common'
import { BusCompaniesController } from './bus-companies.controller'
import { BusCompaniesService } from './bus-companies.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BusCompany } from './entities/bus-company.entity'

@Module({
  imports: [TypeOrmModule.forFeature([BusCompany])],
  controllers: [BusCompaniesController],
  providers: [BusCompaniesService]
})
export class BusCompaniesModule {}
