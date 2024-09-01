import { Body, Controller, Post } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { ResponseData } from 'common/core/response-success.dto'

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    const data = await this.bookingsService.createBooking(createBookingDto)

    return new ResponseData({ message: 'Create booking successfully', data })
  }
}
