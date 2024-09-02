import { Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payment } from './entities/payment.entity'
import { Booking } from 'src/bookings/entities/booking.entity'
import { PaymentStrategyFactory } from './factories/payment-strategy.factory'
import { PricesModule } from 'src/prices/prices.module'

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Booking]), PricesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentStrategyFactory],
  exports: [PaymentsService]
})
export class PaymentsModule {}
