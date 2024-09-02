import { Type } from '@nestjs/common'
import { PaymentStrategy } from '../interfaces/payment-strategy.interface'
import { PaymentMethod } from 'common/enums/payments.enum'
import { StripeStrategy } from '../strategies/stripe.strategy'

export const PAYMENT_STRATEGIES = new Map<PaymentMethod, Type<PaymentStrategy>>([
  [PaymentMethod.Stripe, StripeStrategy]
])
