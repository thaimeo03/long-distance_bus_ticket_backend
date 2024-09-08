import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { Bus_Status } from 'common/enums/buses.enum'

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
  @IsEnum(Bus_Status)
  status?: Bus_Status
}