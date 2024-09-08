import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { BusCompany } from '../bus-companies/entities/bus-company.entity';
import { Bus } from '../buses/entities/bus.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(BusCompany)
        private busCompanyRepository: Repository<BusCompany>,

        @InjectRepository(Bus)
        private busRepository: Repository<Bus>,
    ) { }

    // Quản lý người dùng
    async getAllUsers() {
        return this.userRepository.find();
    }


    async updateUser(id: string, userData: Partial<User>) {
        return this.userRepository.update(id, userData);
    }

    async deleteUser(id: string) {
        return this.userRepository.delete(id);
    }

    // Quản lý công ty xe buýt
    async getAllBusCompanies() {
        return this.busCompanyRepository.find();
    }


    async updateBusCompany(id: string, companyData: Partial<BusCompany>) {
        return this.busCompanyRepository.update(id, companyData);
    }

    async deleteBusCompany(id: string) {
        return this.busCompanyRepository.delete(id);
    }

    // Quản lý xe buýt
    async getAllBuses() {
        return this.busRepository.find();
    }

    async updateBus(id: string, busData: Partial<Bus>) {
        return this.busRepository.update(id, busData);
    }

    async deleteBus(id: string) {
        return this.busRepository.delete(id);
    }

    // Thống kê số lượng người dùng
    async getUserCount() {
        return this.userRepository.count();
    }

    // Thống kê số lượng công ty xe buýt
    async getBusCompanyCount() {
        return this.busCompanyRepository.count();
    }

    // Thống kê số lượng xe buýt đang hoạt động (status = 1)
    async getActiveBusCount() {
        return this.busRepository.count({ where: { status: 1 } });
    }
}
