import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsUUID, Max, Min } from 'class-validator'

export class UserInfoDto {
  @IsUUID()
  id: string // UUID của người dùng

  @IsPhoneNumber(null) // null ở đây để tự động nhận biết mã quốc gia dựa trên đầu vào
  @IsNotEmpty()
  phoneNumber: string // Số điện thoại

  @IsEnum([0, 1]) // 0: Nữ, 1: Nam
  sex: number // Giới tính

  @IsNotEmpty()
  dateOfBirth: Date // Ngày sinh

  @IsEmail()
  @IsNotEmpty()
  email: string // Địa chỉ email

  @IsEnum([0, 1, 2]) // 0: user, 1: admin, 2: superadmin (có thể tuỳ chỉnh)
  role: number // Vai trò

  @Min(1)
  @Max(100)
  @IsOptional() // Có thể không cần truyền nếu không cần thiết
  age?: number // Tuổi (có thể tính toán từ dateOfBirth)
}
