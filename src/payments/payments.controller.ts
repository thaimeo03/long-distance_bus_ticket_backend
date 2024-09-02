import { Controller, Get, Query, Res } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { query, Response } from 'express'
import { ProcessPaymentDto } from './dto/process-payment.dto'

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('pay')
  async processPayment(@Query() query: ProcessPaymentDto, @Res() res: Response) {
    const url = await this.paymentsService.processPayment(query)

    console.log(url)

    res.redirect(url)
  }
}
