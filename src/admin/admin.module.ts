import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { User } from '../users/entities/user.entity'
import { BusCompany } from '../bus-companies/entities/bus-company.entity'
import { Bus } from '../buses/entities/bus.entity'
import { Payment } from '../payments/entities/payment.entity'
import { Booking } from '../bookings/entities/booking.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, BusCompany, Bus, Payment, Booking])],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
