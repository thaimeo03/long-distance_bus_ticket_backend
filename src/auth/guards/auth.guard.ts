import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { ROLES_KEY } from 'common/decorators/roles.de'
import { Role } from 'common/enums/users.enum'

@Injectable()
export class AuthGuardJwt extends AuthGuard('auth') {
  private reflector = new Reflector()

  constructor() {
    super()
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException()
    }

    // Get roles from decorator and check if user has roles
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()])

    if (!roles) return user

    if (!roles.includes(user.role)) throw new ForbiddenException()

    return user
  }
}
