import { Transform } from 'class-transformer'
import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsUUID, ValidateNested } from 'class-validator'
import { ScheduleSortBy, ScheduleSortOrder } from 'common/enums/schedules.enum'

export class IPeriodTime {
  startTime: number
  endTime: number
}

export class FilterSchedulesDto {
  @IsOptional()
  @IsNumber()
  @Transform((o) => Number(o.obj['limit']))
  limit?: number

  @IsOptional()
  @IsNumber()
  @Transform((o) => Number(o.obj['page']))
  page?: number

  @IsOptional()
  @ValidateNested()
  @IsArray()
  @IsObject({ each: true })
  periodDepartures?: IPeriodTime[]

  @IsOptional()
  @ValidateNested()
  @IsArray()
  @IsObject({ each: true })
  periodArrivals?: IPeriodTime[]

  @IsOptional()
  @IsUUID()
  companyId?: string[]

  @IsOptional()
  @IsEnum(ScheduleSortBy)
  sortBy?: number

  @IsOptional()
  @IsEnum(ScheduleSortOrder)
  sortOrder?: number
}
