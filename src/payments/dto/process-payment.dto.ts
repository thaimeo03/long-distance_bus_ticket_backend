import { PaymentMethod } from 'common/enums/payments.enum'

export class ProcessPaymentDto {
  method: PaymentMethod
  bookingId: string
}
