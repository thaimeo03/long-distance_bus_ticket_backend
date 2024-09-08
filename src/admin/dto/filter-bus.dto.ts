import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { BusStatus } from 'common/enums/buses.enum'

export class FilterBusDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number

  @IsOptional()
  @IsEnum(BusStatus)
  status?: BusStatus
}
