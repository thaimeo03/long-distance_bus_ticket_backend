import { IsUUID } from 'class-validator'

export class CreatePriceDto {
  @IsUUID()
  routeId: string

  @IsUUID()
  startStopId: string

  @IsUUID()
  endStopId: string
}
