import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { FindOptionsWhere, Like, Repository } from 'typeorm'
import { ResponseData, ResponseDataWithPagination } from 'common/customs/responseData'
import { FilterUserDto } from './dto/filter-blogger.dto'
import { FilterBusDto } from './dto/filter-blog.dto'
import { Bus } from 'src/buses/entities/blog.entity'
import { Bus_Status } from 'common/enums/buses.enum'
import { Cron } from '@nestjs/schedule'
import { UpdateRoleDto } from './dto/update-role.dto'
import { Role } from 'common/enums/users.enum'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Bus) private readonly busesRepository: Repository<Bus>
  ) {}

  async findAllUsers({ adminId, filterUserDto }: { adminId: string; filterUserDto: FilterUserDto }) {
    const { limit, page, searchNameTerm } = filterUserDto

    // Define query
    const limitQuery = limit ? limit : 11
    const pageQuery = page ? page : 1
    const searchNameTermQuery = searchNameTerm ? Like(`%${searchNameTerm}%`) : undefined

    const whereQuery: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {
      name: searchNameTermQuery
    }

    // Get bloggers by filters
    const users = await this.usersRepository.find({
      where: whereQuery,
      select: {
        id: true,
        name: true,
        email: true,
        sex: true,
        dateOfBirth: true,
        role: true
      },
      order: {
        createdAt: 'DESC'
      },
      take: limitQuery,
      skip: (pageQuery - 1) * limitQuery
    })

    // Remove this admin from the list
    const usersWithoutThisAdmin = users.filter((user) => user.id !== adminId)

    const totalPage = Math.ceil(
      (await this.usersRepository.count({
        where: whereQuery
      })) / limitQuery
    )

    return new ResponseDataWithPagination({
      message: 'Get all bloggers successfully',
      data: usersWithoutThisAdmin,
      pagination: {
        limit: +limitQuery,
        current_page: +pageQuery,
        total_page: totalPage
      }
    })
  }

  async findAllBuses(filterBusDto: FilterBusDto) {
    const { limit, page } = filterBusDto
    const limitQuery = limit ? limit : 10
    const pageQuery = page ? page : 1

    const whereQuery: FindOptionsWhere<Bus> | FindOptionsWhere<Bus>[] = {
      status: filterBusDto.status
    }

    // Get blogs by filters
    const buses = await this.busesRepository.find({
      where: whereQuery,
      select: {
          id: true,
          name: true,
          busNumber: true,
          status: true,
          busCompany: {
            name: true
        },
      },
      order: {
        createdAt: 'DESC'
      },
      take: limitQuery,
      skip: (pageQuery - 1) * limitQuery
    })

    const totalPage = Math.ceil(
      (await this.busesRepository.count({
        where: whereQuery
      })) / limitQuery
    )

    return new ResponseDataWithPagination({
      message: 'Get all bus successfully',
      data: buses,
      pagination: {
        limit: +limitQuery,
        current_page: +pageQuery,
        total_page: totalPage
      }
    })
  }

  async updateRole({ id, updateRoleDto }: { id: string; updateRoleDto: UpdateRoleDto }) {
    const user = await this.bloggersRepository.findOneBy({ id })

    if (!user) {
      throw new NotFoundException('User not found')
    }

      if (user.role === Role.Admin) {
      throw new ForbiddenException('You can not change the role of a user who is admin')
    }

    await this.usersRepository.update(id, {
      role: updateRoleDto.role,
      refreshToken: null // Make blogger logout
    })

    return new ResponseData({
      message: 'Update role successfully'
    })
  }

//   async analyzeUserQuantityCreated() {
//     const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
//     startOfWeek.setHours(0, 0, 0, 0)

//     const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)

//     const result: any = await this.bloggersRepository.query(
//       `SELECT DATE(createdAt) AS date, COUNT(*) AS quantity 
//       FROM blogger 
//       WHERE createdAt >= '${startOfWeek.toISOString()}' 
//       AND createdAt < '${endOfWeek.toISOString()}' 
//       GROUP BY DATE(createdAt)`
//     )

//     const blogsQuantityInLastWeek = {
//       monday: 0,
//       tuesday: 0,
//       wednesday: 0,
//       thursday: 0,
//       friday: 0,
//       saturday: 0,
//       sunday: 0
//     }

//     for (const row of result) {
//       const day = new Date(row.date).getDay()
//       const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
//       blogsQuantityInLastWeek[days[day]] += +row.quantity
//     }

//     return new ResponseData({
//       message: 'Get blogger quantity created successfully',
//       data: {
//         blogsQuantityInLastWeek
//       }
//     })
//   }

  async analyzeBusStatus() {
      const buses = await this.busesRepository.find()

      let busesIsReady = 0
      let busesIsEnRoute = 0
      let busesIsArrived = 0
      let busesIsMaintenance = 0

    for (const bus of buses) {
        if (bus.status === Bus_Status.Ready) {
            busesIsReady++
        } else if (bus.status === Bus_Status.EnRoute) {
            busesIsEnRoute++
        } else if (bus.status === bus_Status.Arrived) {
            busesIsArrived++
      }else if(bus.status === Bus_Status.Maintenance) {
            busesIsMaintenance++
      }
    }

    return new ResponseData({
      message: 'Get blog statuses successfully',
      data: {
          busesIsReady,
          busesIsEnRoute,
          busesIsArrived,
          busesIsMaintenance
      }
    })
  }

  // Task scheduling
  @Cron('0 */30 * * * *') // Every 30 minutes
  async deleteMaintenanceBuses() {
    this.logger.log('Deleting maintenance buses...')

    await this.busesRepository.delete({ status: Bus_Status.Maintenance })
  }
}
