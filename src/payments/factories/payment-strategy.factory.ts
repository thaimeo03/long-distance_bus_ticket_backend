import { Injectable } from '@nestjs/common'
import { PaymentStrategy } from '../interfaces/payment-strategy.interface'
import { PAYMENT_STRATEGIES } from '../constants/payment-strategies.constant'
import { PaymentMethod } from 'common/enums/payments.enum'
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class PaymentStrategyFactory {
  constructor(private moduleRef: ModuleRef) {}

  async createPaymentStrategy(method: PaymentMethod): Promise<PaymentStrategy> {
    const strategy = PAYMENT_STRATEGIES.get(method)
    if (!strategy) {
      throw new Error(`Payment method ${method} not supported`)
    }

    return await this.moduleRef.create(strategy)
  }
}
