import { Transform } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

export class FindBookingByUserDto {
  @IsOptional()
  @IsNumber()
  @Transform((o) => Number(o.obj['limit']))
  limit?: number

  @IsOptional()
  @IsNumber()
  @Transform((o) => Number(o.obj['page']))
  page?: number
}
