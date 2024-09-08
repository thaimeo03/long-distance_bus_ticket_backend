import { IsEnum, IsNotEmpty } from 'class-validator'
import { Role } from 'common/enums/users.enum'

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role
}
