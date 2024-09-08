import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // Lấy thống kê số lượng người dùng
    @Get('report/users')
    getUserCount() {
        return this.adminService.getUserCount();
    }

    // Lấy thống kê số lượng công ty xe buýt
    @Get('report/bus-companies')
    getBusCompanyCount() {
        return this.adminService.getBusCompanyCount();
    }

    // Lấy thống kê số lượng xe buýt đang hoạt động
    @Get('report/active-buses')
    getActiveBusCount() {
        return this.adminService.getActiveBusCount();
    }
}
