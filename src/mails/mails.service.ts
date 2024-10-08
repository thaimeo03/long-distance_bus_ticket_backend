import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import { TicketInfoDto } from './dto/ticket-info.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'

@Injectable()
export class MailsService {
  private readonly logger = new Logger(MailsService.name)
  private readonly FROM = '"Dịch vụ đặt xe khách" <thaitran15072003@gmail.com>'

  constructor(private mailerService: MailerService) {}

  async sendTicketInfo(tickInfoDto: TicketInfoDto) {
    this.logger.log('Send ticket information...')

    await this.mailerService.sendMail({
      to: tickInfoDto.user.email,
      from: this.FROM,
      subject: 'Ticket Information',
      template: './ticket.template.hbs',
      context: {
        // ✏️ filling curly brackets with content
        code: tickInfoDto.code,
        fullName: tickInfoDto.user.fullName,
        age: tickInfoDto.user.age,
        phoneNumber: tickInfoDto.user.phoneNumber,
        quantity: tickInfoDto.quantity,
        amount: tickInfoDto.amount,
        seats: tickInfoDto.seats,
        pickupLocation: tickInfoDto.pickupLocation,
        dropOffLocation: tickInfoDto.dropOffLocation,
        departureTime: tickInfoDto.departureTime
      }
    })
  }

  async sendForgotPasswordOTP(forgotPasswordOTP: ForgotPasswordDto) {
    this.logger.log('Send forgot password OTP...')

    await this.mailerService.sendMail({
      to: forgotPasswordOTP.email,
      from: this.FROM,
      subject: 'Forgot password OTP',
      template: './forgot-password.template.hbs',
      context: {
        fullName: forgotPasswordOTP.fullName,
        otp: forgotPasswordOTP.OTP
      }
    })
  }
}
