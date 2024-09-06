import { Payment } from '../entities/payment.entity'

export interface PaymentStrategy {
  pay(bookingId: string): Promise<string>
  inActivePayment(bookingId: string): void
  refunds(payment: Payment): Promise<void>
}
