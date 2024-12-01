import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator'

export class CreateRouteDto {
  @IsString()
  @MinLength(3)
  startLocation: string

  @IsString()
  @MinLength(3)
  endLocation: string

  @IsNumber()
  @IsInt()
  @Min(1)
  distanceKm: number

  @IsNumber()
  @Min(1)
  durationHours: number
}
