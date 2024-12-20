import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as ExcelJS from 'exceljs'
import { Response } from 'express'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { FindOptionsWhere, Like, Repository } from 'typeorm'
//      Add some
import { ResponseData, ResponseDataWithPagination } from 'common/core/response-success.dto'
import { FilterUserDto } from './dto/filter-user.dto'
import { FilterBusDto } from './dto/filter-bus.dto'
import { Bus } from 'src/buses/entities/bus.entity'
import { BusStatus } from 'common/enums/buses.enum'
import { Cron } from '@nestjs/schedule'
import { UpdateRoleDto } from './dto/update-role.dto'
import { Role } from 'common/enums/users.enum'
import { BusCompany } from 'src/bus-companies/entities/bus-company.entity'
import { Payment } from 'src/payments/entities/payment.entity'
import { Booking } from 'src/bookings/entities/booking.entity'
import { Schedule } from 'src/schedules/entities/schedule.entity'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Bus) private readonly busesRepository: Repository<Bus>,
    @InjectRepository(BusCompany) private readonly busCompaniesRepository: Repository<BusCompany>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Schedule) private readonly scheduleRepository: Repository<Schedule>
  ) {}

  async findAllUsers({ adminId, filterUserDto }: { adminId: string; filterUserDto: FilterUserDto }) {
    const { limit, page, searchNameTerm } = filterUserDto

    // Define query
    const limitQuery = limit ? limit : 11
    const pageQuery = page ? page : 1
    const searchNameTermQuery = searchNameTerm ? Like(`%${searchNameTerm}%`) : undefined

    const whereQuery: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {
      fullName: searchNameTermQuery
    }

    // Get bloggers by filters
    const users = await this.usersRepository.find({
      where: whereQuery,
      select: {
        id: true,
        fullName: true,
        email: true,
        sex: true,
        phoneNumber: true,
        dateOfBirth: true,
        role: true
      },
      order: {
        // createdAt: 'DESC'
        fullName: 'DESC'
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
      message: 'Get all users successfully',
      data: usersWithoutThisAdmin,
      pagination: {
        limit: +limitQuery,
        current_page: +pageQuery,
        total_page: totalPage
      }
    })
  }

  async findAllBuses(filterBusDto: FilterBusDto) {
    const { limit, page, status } = filterBusDto
    const limitQuery = limit ? limit : 10
    const pageQuery = page ? page : 1
    const statusQuery = status ? status : 0

    const whereQuery: FindOptionsWhere<Bus> | FindOptionsWhere<Bus>[] = {
      status: statusQuery
    }

    // Get blogs by filters
    const buses = await this.busesRepository.find({
      where: whereQuery,
      relations: ['busCompany'],
      select: {
        id: true,
        name: true,
        busNumber: true,
        status: true,
        busCompany: {
          name: true
        }
      },
      order: {
        // createdAt: 'DESC'
        name: 'DESC'
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
    const user = await this.usersRepository.findOneBy({ id })

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng')
    }

    if (user.role === Role.Admin) {
      throw new ForbiddenException('Bạn không thể thay đổi vai trò của người dùng là quản trị viên')
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
      if (bus.status === BusStatus.Ready) {
        busesIsReady++
      } else if (bus.status === BusStatus.EnRoute) {
        busesIsEnRoute++
      } else if (bus.status === BusStatus.Arrived) {
        busesIsArrived++
      } else if (bus.status === BusStatus.Maintenance) {
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

  async getUserCount() {
    const cnt = await this.usersRepository.count()

    return new ResponseData({
      message: 'Get user count successfully',
      data: cnt
    })
  }

  async getBusCompanyCount() {
    const cnt = await this.busCompaniesRepository.count()

    return new ResponseData({
      message: 'Get user count successfully',
      data: cnt
    })
  }

  async getActiveBusCount() {
    const cnt = await this.busesRepository.count({ where: { status: BusStatus.Ready } })

    return new ResponseData({
      message: 'Get active bus count successfully',
      data: cnt
    })
  }

  async analyzeSalesInWeek() {
    const data = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('EXTRACT(YEAR FROM payment.paymentDate)', 'year')
      .addSelect('EXTRACT(WEEK FROM payment.paymentDate)', 'week')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .groupBy('year')
      .addGroupBy('week')
      .orderBy('year')
      .addOrderBy('week')
      .getRawMany()

    return new ResponseData({
      message: 'Get sales in week successfully',
      data
    })
  }

  async analyzeSalesInMonth() {
    const data = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('EXTRACT(YEAR FROM payment.paymentDate)', 'year')
      .addSelect('EXTRACT(MONTH FROM payment.paymentDate)', 'month')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .groupBy('year')
      .addGroupBy('month')
      .orderBy('year')
      .addOrderBy('month')
      .getRawMany()

    return new ResponseData({
      message: 'Get sales in month successfully',
      data
    })
  }

  async analyzeCompanySalesInWeek(id: string) {
    let data: any

    if (id === 'all') {
      data = (await this.analyzeSalesInWeek()).data
    } else {
      data = await this.bookingRepository
        .createQueryBuilder('booking')
        .innerJoinAndSelect('booking.payment', 'payment')
        .innerJoinAndSelect('booking.seats', 'seat')
        .innerJoinAndSelect('seat.bus', 'bus')
        .innerJoinAndSelect('bus.busCompany', 'busCompany')
        .select('EXTRACT(YEAR FROM payment.paymentDate)', 'year')
        .addSelect('EXTRACT(WEEK FROM payment.paymentDate)', 'week')
        .addSelect('SUM(payment.amount)', 'totalAmount')
        .groupBy('year')
        .addGroupBy('week')
        .addGroupBy('busCompany.name')
        .orderBy('year')
        .addOrderBy('week')
        .where('busCompany.id = :id', { id })
        .getRawMany()
    }

    return new ResponseData({
      message: 'Get company sales in week successfully',
      data
    })
  }

  async analyzeCompanySalesInMonth(id: string) {
    let data: any

    if (id === 'all') {
      data = (await this.analyzeSalesInMonth()).data
    } else {
      data = await this.bookingRepository
        .createQueryBuilder('booking')
        .innerJoinAndSelect('booking.payment', 'payment')
        .innerJoinAndSelect('booking.seats', 'seat')
        .innerJoinAndSelect('seat.bus', 'bus')
        .innerJoinAndSelect('bus.busCompany', 'busCompany')
        .select('EXTRACT(YEAR FROM payment.paymentDate)', 'year')
        .addSelect('EXTRACT(MONTH FROM payment.paymentDate)', 'month')
        .addSelect('SUM(payment.amount)', 'totalAmount')
        .groupBy('year')
        .addGroupBy('month')
        .addGroupBy('busCompany.name')
        .orderBy('year')
        .addOrderBy('month')
        .where('busCompany.id = :id', { id })
        .getRawMany()
    }

    return new ResponseData({
      message: 'Get company sales in month successfully',
      data
    })
  }

  async analyzeByRoute() {
    const data = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.booking', 'booking')
      .innerJoin('booking.pickupStop', 'pickupStop')
      .innerJoin('booking.dropOffStop', 'dropOffStop')
      .select(["CONCAT(pickupStop.location, ' -> ', dropOffStop.location) AS route", 'COUNT(*) AS count'])
      .groupBy('route')
      .getRawMany()

    return new ResponseData({
      message: 'Get analyze by route successfully',
      data
    })
  }

  // Task scheduling
  // @Cron('0 */30 * * * *') // Every 30 minutes

  // async deleteMaintenanceBuses() {
  //   this.logger.log('Deleting maintenance buses...')

  //   await this.busesRepository.delete({ status: BusStatus.Maintenance })
  // }

  async analyzeBusDepartureByTimeSlot() {
    const data = await this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoinAndSelect('booking.payment', 'payment', 'payment.id = booking.paymentId')
      .innerJoinAndSelect('booking.schedule', 'schedule', 'booking.scheduleId = schedule.id')
      .innerJoin('schedule.bus', 'bus')
      .select([
        `CASE 
        WHEN EXTRACT(HOUR FROM schedule.departureTime) BETWEEN 0 AND 5 THEN '0h-6h'
        WHEN EXTRACT(HOUR FROM schedule.departureTime) BETWEEN 6 AND 11 THEN '6h-12h'
        WHEN EXTRACT(HOUR FROM schedule.departureTime) BETWEEN 12 AND 17 THEN '12h-18h'
        ELSE '18h-24h'
      END AS timeSlot`,
        'COUNT(*) AS departureCount'
      ])
      .groupBy('timeSlot')
      .orderBy('timeSlot')
      .getRawMany()

    return new ResponseData({
      message: 'Get analyze bus departure by time slot successfully',
      data
    })
  }

  async exportAnalyzeReportCompanySalesInMonth(id: string, res: Response) {
    const monthlyRevenue = (await this.analyzeCompanySalesInMonth(id)).data
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Monthly Revenue')

    worksheet.columns = [
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Total Revenue', key: 'totalRevenue', width: 15 }
    ]

    monthlyRevenue.forEach((row) => {
      worksheet.addRow({
        year: row.year,
        month: row.month,
        totalRevenue: row.totalAmount
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=monthly-revenue.xlsx')

    await workbook.xlsx.write(res)
    res.end()
  }

  async exportAnalyzeReportCompanySalesInWeek(id: string, res: Response) {
    const weeklyRevenue = (await this.analyzeCompanySalesInWeek(id)).data

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Weekly Revenue')

    worksheet.columns = [
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Week', key: 'week', width: 10 },
      { header: 'Total Revenue', key: 'totalRevenue', width: 15 }
    ]

    weeklyRevenue.forEach((row) => {
      worksheet.addRow({
        year: row.year,
        week: row.week,
        totalRevenue: row.totalAmount
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=weekly-revenue.xlsx')

    await workbook.xlsx.write(res)
    res.end()
  }
}
