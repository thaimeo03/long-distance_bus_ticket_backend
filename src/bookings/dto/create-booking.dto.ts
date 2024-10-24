import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength
} from 'class-validator'

export class CreateBookingDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[\p{L} ]+$/u, { message: 'Full name must only contain letters' })
  fullName: string

  @IsEmail()
  email: string

  @IsNumber()
  @Min(1)
  @Max(100)
  age: number

  @IsString()
  @IsNumberString({ no_symbols: true })
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
