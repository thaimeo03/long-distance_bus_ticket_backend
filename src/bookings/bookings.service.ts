import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Booking } from './entities/booking.entity'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UsersService } from 'src/users/users.service'
import { SeatsService } from 'src/seats/seats.service'
import { Schedule } from 'src/schedules/entities/schedule.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { PaymentsService } from 'src/payments/payments.service'
import { PricesService } from 'src/prices/prices.service'
import { CancelBookingDto } from './dto/cancel-booking.dto'
import { FindBookingByUserDto } from './dto/find-booking-by-user.dto'

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name)

  constructor(
    private configService: ConfigService,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>,
    @InjectRepository(RouteStop) private routeStopRepository: Repository<RouteStop>,
    private usersService: UsersService,
    private seatsService: SeatsService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
    private pricesService: PricesService
  ) {}

  // 1. Check user exists. If not, create one (user draft)
  // 2. Book seats
  // 3. Check schedule exists
  // 4. Check pickupStop and dropOffStop exists
  // 5. Create booking, payment and return it
  async createBooking(createBookingDto: CreateBookingDto) {
    // 1
    const user = await this.usersService.createUserDraft(createBookingDto)
    // 2
    const seats = await this.seatsService.bookSeats({ seats: createBookingDto.seats, busId: createBookingDto.busId })
    // 3
    const schedule = await this.scheduleRepository.findOne({ where: { id: createBookingDto.scheduleId } })
    if (!schedule) throw new NotFoundException('Schedule not found')
    // 4
    const pickupStop = await this.routeStopRepository.findOne({ where: { id: createBookingDto.pickupStopId } })
    if (!pickupStop) throw new NotFoundException('Pickup stop not found')

    const dropOffStop = await this.routeStopRepository.findOne({ where: { id: createBookingDto.dropOffStopId } })
    if (!dropOffStop) throw new NotFoundException('Drop off stop not found')

    // 5
    const price = await this.pricesService.getPriceByRouteStops({
      pickupStopId: createBookingDto.pickupStopId,
      dropOffStopId: createBookingDto.dropOffStopId
    })
    const payment = await this.paymentsService.createPayment({
      amount: price.price
    })
    const booking = this.bookingRepository.create({
      user,
      quantity: createBookingDto.seats.length,
      bookingDate: new Date(),
      seats: seats,
      schedule,
      pickupStop,
      dropOffStop,
      payment
    })

    const bookingSaved = await this.bookingRepository.save(booking)

    return {
      bookingId: bookingSaved.id,
      quantity: bookingSaved.quantity
    }
  }

  // 1. Find all bookings overdue
  // 2. Update seat status and in active payment
  // 3. Remove them
  @Cron('*/10 * * * * *') // every 10 seconds
  async removeBookingOverdue() {
    const TIME_LIMIT = this.configService.get('BOOKING_TIME_LIMIT') || 1 // per minute

    // 1
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.seats', 'seats')
      .innerJoinAndSelect('booking.schedule', 'schedule')
      .innerJoinAndSelect('schedule.bus', 'bus')
      .innerJoinAndSelect('booking.payment', 'payment')
      .where('payment.paymentStatus = :status', { status: false })
      .andWhere('booking.bookingDate < :timeLimit', {
        timeLimit: new Date(Date.now() - TIME_LIMIT * 60 * 1000)
      })
      .getMany()

    // 2 and 3
    const removedBookings = await Promise.all(
      bookings.map(async (booking) => {
        return await this.removeBooking(booking)
      })
    )

    this.logger.log(`Removed ${removedBookings.length} bookings.`)
  }

  async getBookingInfo(bookingId: string) {
    const bookingInfo = await this.bookingRepository.findOne({
      relations: ['seats', 'schedule', 'user', 'payment', 'pickupStop', 'dropOffStop'],
      where: { id: bookingId },
      select: {
        id: true,
        quantity: true,
        user: {
          fullName: true,
          age: true,
          email: true,
          phoneNumber: true
        },
        seats: true,
        payment: {
          amount: true
        },
        pickupStop: {
          location: true
        },
        dropOffStop: {
          location: true
        },
        schedule: {
          departureTime: true
        }
      }
    })

    if (!bookingInfo) throw new NotFoundException('Booking not found')

    return bookingInfo
  }

  // 1. Find booking
  // 2. Check out due time (hours)
  // 3. Remove booking
  // 4. Refund
  async cancelBooking(cancelBookingDto: CancelBookingDto) {
    // 1
    const { email, ticketCode } = cancelBookingDto

    const booking = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.payment', 'payment')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.seats', 'seats')
      .leftJoinAndSelect('booking.schedule', 'schedule')
      .leftJoinAndSelect('schedule.bus', 'bus')
      .where('CAST(booking.id AS TEXT) LIKE :ticketCode', { ticketCode: `${ticketCode}%` })
      .andWhere('user.email = :email', { email })
      .getOne()

    if (!booking) {
      throw new NotFoundException('Booking not found')
    }

    if (!booking.payment.paymentStatus) {
      throw new BadRequestException('Payment is not success')
    }

    // 2
    const dueTime = this.configService.get('BOOKING_CANCEL_TIME') // 24 hours

    if (booking.schedule.departureTime.getTime() < Date.now() + dueTime * 60 * 60 * 1000) {
      throw new BadRequestException('Booking is due to be canceled')
    }

    // 3 and 4
    await Promise.all([await this.removeBooking(booking), await this.paymentsService.refunds(booking.payment)])
  }

  async removeBooking(booking: Booking) {
    await this.seatsService.unBookSeats({
      seats: booking.seats.map((seat) => seat.seatNumber),
      busId: booking.schedule.bus.id
    })

    await this.paymentsService.inActivePayment({ bookingId: booking.id, method: booking.payment.method })
    await this.bookingRepository.remove(booking)
    return await this.paymentsService.deletePayment(booking.payment.id)
  }

  async findBookingsByUser({
    userId,
    findBookingByUserDto
  }: {
    userId: string
    findBookingByUserDto: FindBookingByUserDto
  }) {
    const limit = findBookingByUserDto.limit || 7
    const page = findBookingByUserDto.page || 1

    const [bookingInfo, count] = await this.bookingRepository.findAndCount({
      relations: ['seats', 'schedule', 'user', 'payment', 'pickupStop', 'dropOffStop'],
      where: { user: { id: userId } },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        quantity: true,
        seats: true,
        payment: {
          amount: true
        },
        pickupStop: {
          location: true
        },
        dropOffStop: {
          location: true
        },
        schedule: {
          departureTime: true
        }
      }
    })

    if (!bookingInfo) throw new NotFoundException('Booking not found')

    return {
      data: bookingInfo,
      pagination: {
        limit,
        current_page: page,
        total_page: Math.ceil(count / limit)
      }
    }
  }
}
