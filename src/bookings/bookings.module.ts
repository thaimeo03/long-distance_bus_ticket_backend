import { Module } from '@nestjs/common'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Booking } from './entities/booking.entity'
import { UsersModule } from 'src/users/users.module'
import { SeatsModule } from 'src/seats/seats.module'
import { Schedule } from 'src/schedules/entities/schedule.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { PaymentsModule } from 'src/payments/payments.module'
import { PricesModule } from 'src/prices/prices.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Schedule, RouteStop]),
    UsersModule,
    SeatsModule,
    PaymentsModule,
    PricesModule
  ],
  controllers: [BookingsController],
  providers: [BookingsService]
})
export class BookingsModule {}
