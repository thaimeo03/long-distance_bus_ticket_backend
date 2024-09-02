import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
const stripe = new Stripe(
  'sk_test_51PuI8S04HawVqBs75w181D3qfyEnqDjPEInrVqUSNpp6MRYCMdK1vHjHwtivLyeCoo78Z7VDFEIT1Trz1N2DxyYD00kPSCNQsC'
)

@Injectable()
export class PaymentsService {
  async testStripe() {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1PuIkt04HawVqBs7NC8J2Afd',
          quantity: 2
        }
      ],
      customer_email: 'thai@gmail.com',
      mode: 'payment',
      success_url: `http://localhost:9999?success=true`,
      cancel_url: `http://localhost:9999?canceled=true`
    })

    return session
  }
}
