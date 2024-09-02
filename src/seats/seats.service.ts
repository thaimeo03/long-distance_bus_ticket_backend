import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Seat } from './entities/seat.entity'
import { Repository } from 'typeorm'
import { Bus } from 'src/buses/entities/bus.entity'

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat) private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Bus) private readonly busRepository: Repository<Bus>
  ) {}

  // 1. Check bus exists
  // 2. Check seat is available and update it
  async bookSeats({ seats, busId }: { seats: number[]; busId: string }) {
    const bus = await this.busRepository.findOne({
      where: { id: busId }
    })
    if (!bus) throw new NotFoundException('Bus not found')

    return await Promise.all(
      seats.map(async (seat) => {
        const seatToUpdate = await this.seatRepository.findOne({ where: { seatNumber: seat, bus } })
        if (!seatToUpdate || !seatToUpdate.isAvailable) throw new BadRequestException('Seat not available')
        seatToUpdate.isAvailable = false
        return await this.seatRepository.save(seatToUpdate)
      })
    )
  }

  // 1. Check seat is available and update it
  async unBookSeats({ seats, busId }: { seats: number[]; busId: string }) {
    const bus = await this.busRepository.findOne({
      where: { id: busId }
    })
    if (!bus) throw new NotFoundException('Bus not found')

    await Promise.all(
      seats.map(async (seat) => {
        await this.seatRepository.update({ seatNumber: seat, bus }, { isAvailable: true })
      })
    )
  }
}
