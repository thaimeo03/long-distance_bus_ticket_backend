import { forwardRef, Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payment } from './entities/payment.entity'
import { PricesModule } from 'src/prices/prices.module'
import { BookingsModule } from 'src/bookings/bookings.module'
import { PaymentStrategyFactory } from './factories/payment-strategy.factory'
import { StripeStrategy } from './strategies/stripe.strategy'
import { Booking } from 'src/bookings/entities/booking.entity'
import { MailsModule } from 'src/mails/mails.module'

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Booking]), PricesModule, MailsModule, forwardRef(() => BookingsModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentStrategyFactory, StripeStrategy],
  exports: [PaymentsService]
})
export class PaymentsModule {}
