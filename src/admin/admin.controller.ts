import { Controller, Get, Post, Put, Delete, Param, Body, Req, Query } from '@nestjs/common'
import { AdminService } from './admin.service'
import { UserInfoDto } from './dto/user-info.dto'
import { BusInfoDto } from './dto/bus-info.dto'
//    Add some
import { UpdateRoleDto } from './dto/update-role.dto'
import { FilterUserDto } from './dto/filter-user.dto'
import { FilterBusDto } from './dto/filter-bus.dto'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers(@Req() req: Request, @Query() filterUserDto: FilterUserDto) {
    const adminId = req['user'].id

		return await this.adminService.findAllUsers({adminId, filterUserDto})
  }

  @Get('buses')
  async getAllBuses(@Query() filterBusDto: FilterBusDto) {
    return await this.adminService.findAllBuses(filterBusDto)
  }

  @Put('user/:id')
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.adminService.updateRole({id, updateRoleDto})
  }

  @Get('report/users')
  async getUserCount() {
    return this.adminService.getUserCount()
  }

  @Get('report/bus-companies')
  async getBusCompanyCount() {
    return this.adminService.getBusCompanyCount()
  }

  @Get('report/active-buses')
  async getActiveBusCount() {
    return this.adminService.getActiveBusCount()
  }
}