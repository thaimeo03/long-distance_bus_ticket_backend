export class CreateBookingDto {
  fullName: string
  email: string
  age: number
  phoneNumber: string
  seats: number[]
  busId: string
  scheduleId: string
  pickupStopId: string
  dropOffStopId: string
}
