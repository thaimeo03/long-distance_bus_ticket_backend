import { IsNumber, IsNumberString, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  fullName?: string

  @IsOptional()
  @IsString()
  @MinLength(10)
  @IsNumberString()
  phoneNumber?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  age?: number
}
