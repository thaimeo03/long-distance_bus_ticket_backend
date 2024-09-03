import { Controller, Get, Query, Res } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { query, Response } from 'express'
import { ProcessPaymentDto } from './dto/process-payment.dto'
import { ResponseData } from 'common/core/response-success.dto'

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('pay')
  async processPayment(@Query() query: ProcessPaymentDto) {
    const url = await this.paymentsService.processPayment(query)

    return new ResponseData({
      message: 'Process payment successfully',
      data: { url }
    })
  }
}
