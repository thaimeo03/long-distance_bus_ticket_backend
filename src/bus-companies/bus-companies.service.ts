import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BusCompany } from './entities/bus-company.entity'
import { Repository } from 'typeorm'

@Injectable()
export class BusCompaniesService {
  constructor(@InjectRepository(BusCompany) private busCompanyRepository: Repository<BusCompany>) {}

  async findAll() {
    return await this.busCompanyRepository.find({
      select: {
        id: true,
        name: true,
        mainImage: true
      }
    })
  }
}
