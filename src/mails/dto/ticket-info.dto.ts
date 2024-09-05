interface UserDto {
  fullName: string
  email: string
  age: number
  phoneNumber: string
}

export class TicketInfoDto {
  code: string
  quantity: number
  user: UserDto
  seats: string
  amount: number
  pickupLocation: string
  dropOffLocation: string
  departureTime: string
}
