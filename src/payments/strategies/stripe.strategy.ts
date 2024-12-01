import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common'
import { PaymentStrategy } from '../interfaces/payment-strategy.interface'
import Stripe from 'stripe'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Booking } from 'src/bookings/entities/booking.entity'
import { ConfigService } from '@nestjs/config'
import { Payment } from '../entities/payment.entity'
const stripe = new Stripe(
  'sk_test_51PuI8S04HawVqBs75w181D3qfyEnqDjPEInrVqUSNpp6MRYCMdK1vHjHwtivLyeCoo78Z7VDFEIT1Trz1N2DxyYD00kPSCNQsC'
)

@Injectable()
export class StripeStrategy implements PaymentStrategy {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    private configService: ConfigService
  ) {}

  // 1. Check booking exists
  // 2. Get priceStripe
  // 3. Create session
  // 4. Store session id
  async pay(bookingId: string): Promise<string> {
    // 1
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['user', 'payment'],
      select: {
        user: {
          email: true
        }
      }
    })
    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt chỗ')
    }

    const priceStripe = await this.addProductCatalogStripe({ bookingId, amount: booking.payment.amount })

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceStripe.id,
          quantity: booking.quantity
        }
      ],
      customer_email: booking.user.email,
      mode: 'payment',
      success_url: `${this.configService.get('HOST')}/payments/callback?success=1&bookingId=${bookingId}`,
      cancel_url: `${this.configService.get('HOST')}/payments/callback?success=0&bookingId=${bookingId}`
    })

    await this.paymentRepository.update({ id: booking.payment.id }, { sessionId: session.id })

    return session.url
  }

  async inActivePayment(bookingId: string) {
    try {
      const product = await stripe.products.retrieve(bookingId)
      if (product && product.active) {
        await stripe.products.update(bookingId, { active: false })
      }
    } catch (error) {
      // console.log(error)
    }
  }

  // 1. Retrieve checkout session
  // 2. Create refund by payment intent
  async refunds(payment: Payment) {
    // 1
    const { sessionId } = payment
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      throw new BadGatewayException('Thanh toán chưa được thanh toán')
    }
    // 2
    await stripe.refunds.create({
      payment_intent: session.payment_intent.toString()
    })
  }

  async addProductCatalogStripe({ bookingId, amount }: { bookingId: string; amount: number }) {
    // 3
    const priceStripe = await stripe.prices.create({
      currency: 'vnd',
      unit_amount: amount,

      product_data: {
        name: 'Vé xe',
        id: bookingId
      }
    })

    return priceStripe
  }
}
