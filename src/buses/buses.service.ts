import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Bus } from './entities/bus.entity'

@Injectable()
export class BusesService {
  constructor(@InjectRepository(Bus) private readonly busRepository: Repository<Bus>) {}
}
