import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { ResponseData, ResponseDataWithPagination } from 'common/core/response-success.dto'
import { CancelBookingDto } from './dto/cancel-booking.dto'
import { AuthGuardJwt } from 'src/auth/guards/auth.guard'
import { Request } from 'express'
import { FindBookingByUserDto } from './dto/find-booking-by-user.dto'

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    const data = await this.bookingsService.createBooking(createBookingDto)

    return new ResponseData({ message: 'Create booking successfully', data })
  }

  @Post('cancel')
  async cancelBooking(@Body() cancelBookingDto: CancelBookingDto) {
    await this.bookingsService.cancelBooking(cancelBookingDto)

    return new ResponseData({ message: 'Cancel booking successfully' })
  }

  @Get('history')
  @UseGuards(AuthGuardJwt)
  async findBookingsByUser(@Req() req: Request, @Query() findBookingByUserDto: FindBookingByUserDto) {
    const userId = req.user['userId'] as string
    const data = await this.bookingsService.findBookingsByUser({ userId, findBookingByUserDto })

    return new ResponseDataWithPagination({
      message: 'Get bookings successfully',
      data: data.data,
      pagination: data.pagination
    })
  }

  @Get(':id')
  async getBookingInfo(@Param('id') id: string) {
    const data = await this.bookingsService.getBookingInfo(id)

    return new ResponseData({ message: 'Get booking info successfully', data })
  }
}
