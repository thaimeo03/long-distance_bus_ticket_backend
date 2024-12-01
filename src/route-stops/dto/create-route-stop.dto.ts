import { IsDateString, IsInt, IsNumber, IsString, IsUUID, MinLength } from 'class-validator'

export class CreateRouteStopDto {
  @IsString()
  @MinLength(3)
  location: string

  @IsNumber()
  @IsInt()
  distanceFromStartKm: number

  @IsDateString()
  arrivalTime: string

  @IsUUID()
  routeId: string
}
