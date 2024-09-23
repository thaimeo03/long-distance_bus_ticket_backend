import { Controller, Get, Post, Put, Delete, Param, Body, Req, Query, Res, UseGuards } from '@nestjs/common'
import { Response, Request } from 'express'
import { AdminService } from './admin.service'
import { UserInfoDto } from './dto/user-info.dto'
import { BusInfoDto } from './dto/bus-info.dto'
//    Add some
import { UpdateRoleDto } from './dto/update-role.dto'
import { FilterUserDto } from './dto/filter-user.dto'
import { FilterBusDto } from './dto/filter-bus.dto'
import { AuthGuardJwt } from 'src/auth/guards/auth.guard'
import { Roles } from 'common/decorators/roles.de'
import { Role } from 'common/enums/users.enum'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async getAllUsers(@Req() req: Request, @Body() filterUserDto: FilterUserDto) {
    const adminId = req.user['id']

    return await this.adminService.findAllUsers({ adminId, filterUserDto })
  }

  @Get('buses')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async getAllBuses(@Body() filterBusDto: FilterBusDto) {
    return await this.adminService.findAllBuses(filterBusDto)
  }

  @Put('user/update-role/:id')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.adminService.updateRole({ id, updateRoleDto })
  }

  @Get('report/buses-count-by-status')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async getBusStatus() {
    return this.adminService.analyzeBusStatus()
  }

  @Get('report/users-count')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async getUserCount() {
    return this.adminService.getUserCount()
  }

  @Get('report/bus-companies-count')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async getBusCompanyCount() {
    return this.adminService.getBusCompanyCount()
  }

  @Get('report/active-buses-count')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async getActiveBusCount() {
    return this.adminService.getActiveBusCount()
  }

  @Get('report/analyze-in-week')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async analyzeBusInWeek() {
    return await this.adminService.analyzeSalesInWeek()
  }

  @Get('report/analyze-in-month')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async analyzeBusInMonth() {
    return await this.adminService.analyzeSalesInMonth()
  }

  @Get('report/analyze-company-bus-in-week/:id')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async analyzeCompanyBusInWeek(@Param('id') id: string) {
    return await this.adminService.analyzeCompanySalesInWeek(id)
  }

  @Get('report/analyze-company-bus-in-month/:id')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async analyzeCompanyBusInMonth(@Param('id') id: string) {
    return await this.adminService.analyzeCompanySalesInMonth(id)
  }

  @Get('report/analyze-by-route')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async analyzeByRoute() {
    return await this.adminService.analyzeByRoute()
  }

  @Get('report/analyze-bus-departure-by-time-slot')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async analyzeBusDepartureByTimeSlot() {
    return await this.adminService.analyzeBusDepartureByTimeSlot()
  }

  @Get('report/export-analyze-report-company-bus-in-month/:id')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async exportAnalyzeReportCompanySalesInMonth(@Param('id') id: string, @Res() res: Response) {
    return await this.adminService.exportAnalyzeReportCompanySalesInMonth(id, res)
  }

  @Get('report/export-analyze-report-company-bus-in-week/:id')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async exportAnalyzeReportCompanySalesInWeek(@Param('id') id: string, @Res() res: Response) {
    return await this.adminService.exportAnalyzeReportCompanySalesInWeek(id, res)
  }

  @Get('report/analyze-sales-by-week-of-month')
  @UseGuards(AuthGuardJwt)
  @Roles(Role.Admin)
  async analyzeSalesByWeekOfMonth() {
    return await this.adminService.analyzeSalesByWeekOfMonth()
  }
}
