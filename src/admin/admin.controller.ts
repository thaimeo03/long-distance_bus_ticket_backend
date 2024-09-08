import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { AdminService } from './admin.service'
import { UserInfoDto } from './dto/user-info.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers(): Promise<UserInfoDto[]> {
    return await this.adminService.getAllUsers()
  }

  @Get('user/:id')
  async getUserInfo(@Param('id') id: string): Promise<UserInfoDto> {
    return await this.adminService.getUserById(id)
  }

  @Put('user/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserInfoDto> {
    return await this.adminService.updateUser(id, updateUserDto)
  }

  @Delete('user/:id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return await this.adminService.deleteUser(id)
  }

  @Get('report/users')
  getUserCount() {
    return this.adminService.getUserCount()
  }

  @Get('report/bus-companies')
  getBusCompanyCount() {
    return this.adminService.getBusCompanyCount()
  }

  @Get('report/active-buses')
  getActiveBusCount() {
    return this.adminService.getActiveBusCount()
  }
}
