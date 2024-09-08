import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsUUID, Max, Min } from 'class-validator'
import { BusStatus } from 'common/enums/buses.enum'

export class BusInfoDto {
  @IsUUID()
  id: string // UUID của người dùng

  busNumber: string

  status: BusStatus
}
