import { IsDateString, IsNotEmpty } from 'class-validator'

export class FindSchedulesDto {
  @IsNotEmpty({ message: 'Pickup location is required' })
  pickupLocation: string

  @IsNotEmpty({ message: 'Drop off location is required' })
  dropOffLocation: string

  @IsNotEmpty({ message: 'Departure date is required' })
  @IsDateString({ strict: true })
  departureDate: Date
}
