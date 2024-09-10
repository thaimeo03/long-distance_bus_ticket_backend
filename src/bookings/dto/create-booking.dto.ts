import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsString, Max, Min, MinLength } from 'class-validator'

export class CreateBookingDto {
  @IsString()
  @MinLength(3)
  fullName: string

  @IsEmail()
  email: string

  @IsNumber()
  @Min(1)
  @Max(100)
  age: number

  @IsString()
  @MinLength(10)
  phoneNumber: string

  @IsArray()
  @IsNotEmpty({ message: 'Seats are required' })
  seats: number[]

  @IsString()
  @IsNotEmpty({ message: 'Bus is required' })
  busId: string

  @IsString()
  @IsNotEmpty({ message: 'Schedule is required' })
  scheduleId: string

  @IsString()
  @IsNotEmpty({ message: 'Pickup stop is required' })
  pickupStopId: string

  @IsString()
  @IsNotEmpty({ message: 'Drop off stop is required' })
  dropOffStopId: string
}
