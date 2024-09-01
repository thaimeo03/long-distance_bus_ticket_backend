import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Booking } from './entities/booking.entity'
import { CreateBookingDto } from './dto/create-booking.dto'
import { UsersService } from 'src/users/users.service'
import { SeatsService } from 'src/seats/seats.service'
import { Schedule } from 'src/schedules/entities/schedule.entity'
import { RouteStop } from 'src/route-stops/entities/route-stop.entity'

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>,
    @InjectRepository(RouteStop) private routeStopRepository: Repository<RouteStop>,
    private usersService: UsersService,
    private seatsService: SeatsService
  ) {}

  // 1. Check user exists. If not, create one (user draft)
  // 2. Book seats
  // 3. Check schedule exists
  // 4. Check pickupStop and dropOffStop exists
  // 5. Create booking and return it
  async createBooking(createBookingDto: CreateBookingDto) {
    // 1
    const user = await this.usersService.createUserDraft(createBookingDto)
    // 2
    await this.seatsService.bookSeats({ seats: createBookingDto.seats, busId: createBookingDto.busId })
    // 3
    const schedule = await this.scheduleRepository.findOne({ where: { id: createBookingDto.scheduleId } })
    if (!schedule) throw new NotFoundException('Schedule not found')
    // 4
    const pickupStop = await this.routeStopRepository.findOne({ where: { id: createBookingDto.pickupStopId } })
    if (!pickupStop) throw new NotFoundException('Pickup stop not found')

    const dropOffStop = await this.routeStopRepository.findOne({ where: { id: createBookingDto.dropOffStopId } })
    if (!dropOffStop) throw new NotFoundException('Drop off stop not found')

    // 5
    const booking = this.bookingRepository.create({
      user,
      quantity: createBookingDto.seats.length,
      bookingDate: new Date(),
      schedule,
      pickupStop,
      dropOffStop
    })

    return await this.bookingRepository.save(booking)
  }
}
