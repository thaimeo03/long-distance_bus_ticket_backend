import { Controller, Get, Query, Res } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { ProcessPaymentDto } from './dto/process-payment.dto'
import { ResponseData } from 'common/core/response-success.dto'
import { CallbackDto } from './dto/callback.dto'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private configService: ConfigService
  ) {}

  @Get('pay')
  async processPayment(@Query() query: ProcessPaymentDto) {
    const url = await this.paymentsService.processPayment(query)

    return new ResponseData({
      message: 'Process payment successfully',
      data: { url }
    })
  }

  @Get('callback')
  async callback(@Query() query: CallbackDto, @Res() res: Response) {
    const data = await this.paymentsService.callBack(query)

    if (data === true) res.redirect(this.configService.get('CLIENT_URL') + '/payment/success')
    else res.redirect(this.configService.get('CLIENT_URL') + '/payment/fail')
  }
}
