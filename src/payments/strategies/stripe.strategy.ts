import { Injectable, NotFoundException } from '@nestjs/common'
import { PaymentStrategy } from '../interfaces/payment-strategy.interface'
import Stripe from 'stripe'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Booking } from 'src/bookings/entities/booking.entity'
import { ConfigService } from '@nestjs/config'
const stripe = new Stripe(
  'sk_test_51PuI8S04HawVqBs75w181D3qfyEnqDjPEInrVqUSNpp6MRYCMdK1vHjHwtivLyeCoo78Z7VDFEIT1Trz1N2DxyYD00kPSCNQsC'
)

@Injectable()
export class StripeStrategy implements PaymentStrategy {
  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    private configService: ConfigService
  ) {}

  // 1. Check booking exists
  // 2. Get priceStripe
  // 3. Create session
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
      throw new NotFoundException('Booking not found')
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

    return session.url
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
}
