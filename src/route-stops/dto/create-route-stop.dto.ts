import { IsDate, IsInt, IsNumber, IsString, IsUUID, MinLength } from 'class-validator'

export class CreateRouteStopDto {
  @IsString()
  @MinLength(3)
  location: string

  @IsNumber()
  @IsInt()
  distanceFromStartKm: number

  @IsDate()
  arrivalTime: Date

  @IsUUID()
  routeId: string
}
