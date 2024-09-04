import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common'
import { ProcessPaymentDto } from './dto/process-payment.dto'
import { PaymentStrategyFactory } from './factories/payment-strategy.factory'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Payment } from './entities/payment.entity'
import { Repository } from 'typeorm'
import { CallbackDto } from './dto/callback.dto'

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    private paymentStrategyFactory: PaymentStrategyFactory
  ) {}

  // 1. Get strategy
  // 2. Update payment method
  // 3. Pay
  async processPayment(processPaymentDto: ProcessPaymentDto) {
    // 1
    const strategy = await this.paymentStrategyFactory.createPaymentStrategy(Number(processPaymentDto.method))

    // 2
    const payment = await this.paymentRepository.findOne({
      where: { booking: { id: processPaymentDto.bookingId } },
      relations: ['booking']
    })

    if (!payment) {
      throw new NotFoundException('Payment not found')
    }
    await this.paymentRepository.update({ id: payment.id }, { method: processPaymentDto.method })

    return await strategy.pay(processPaymentDto.bookingId)
  }

  // 1. Check payment success?
  // 2. Update payment status
  async callBack(callbackDto: CallbackDto) {
    // 1
    const { bookingId, success } = callbackDto
    if (!success) {
      return false
    }

    // 2
    const payment = await this.paymentRepository.findOne({
      relations: ['booking'],
      where: { booking: { id: bookingId } }
    })

    if (!payment) {
      throw new NotFoundException('Payment not found')
    }

    try {
      await this.paymentRepository.update({ id: payment.id }, { paymentStatus: true, paymentDate: new Date() })
      return true
    } catch (error) {
      return false
    }
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    return await this.paymentRepository.save(createPaymentDto)
  }

  async deletePayment(id: string) {
    return await this.paymentRepository.delete({ id: id })
  }

  async inActivePayment(processPaymentDto: ProcessPaymentDto) {
    const strategy = await this.paymentStrategyFactory.createPaymentStrategy(Number(processPaymentDto.method))

    strategy.inActivePayment(processPaymentDto.bookingId)
  }
}