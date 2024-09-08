import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDraftDto } from './dto/create-user-draft.dto'
import { RegisterDto } from './dto/register.dto'
import { AuthService } from 'src/auth/auth.service'
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private authService: AuthService
  ) {}

  // 1. Check email exists and is not draft
  // 2. Hash password
  // 3. Create user
  // 4. Generate token (access token, refresh token) taken from auth service
  // 5. Save user and return token
  async register(registerDto: RegisterDto) {
    // 1
    const user = await this.userRepository.findOneBy({
      email: registerDto.email
    })
    if (user && !user.isDraft) throw new BadRequestException('Email already exists')

    // 2
    const passwordHash = await bcrypt.hash(registerDto.password, 10)

    // 3
    const newUser = this.userRepository.create({
      id: crypto.randomUUID(),
      fullName: registerDto.fullName,
      phoneNumber: registerDto.phoneNumber,
      email: registerDto.email,
      passwordHashed: passwordHash,
      isDraft: false
    })

    // 4
    const { accessToken, refreshToken } = await this.authService.generateToken(newUser.id)

    // 5
    newUser.refreshToken = refreshToken
    await this.userRepository.save(newUser)

    return { accessToken, refreshToken }
  }

  // 1. Check email exists
  // 2. Check password
  // 3. Generate token (access token, refresh token) taken from auth service
  // 4. Save new refresh token and return token
  async login(loginDto: LoginDto) {
    // 1
    const user = await this.userRepository.findOneBy({
      email: loginDto.email
    })

    if (!user || user.isDraft) throw new BadRequestException('Email or password is incorrect')

    // 2
    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHashed)
    if (!isMatch) throw new BadRequestException('Email or password is incorrect')

    // 3
    const { accessToken, refreshToken } = await this.authService.generateToken(user.id)

    // 4
    await this.userRepository.update({ id: user.id }, { refreshToken })

    return { accessToken, refreshToken }
  }

  // 1. Find user by refresh token
  // 2. Update refresh token is null
  async logout(refreshToken: string) {
    // 1
    if (!refreshToken) throw new UnauthorizedException()
    const user = await this.userRepository.findOneBy({ refreshToken })
    if (!user) throw new UnauthorizedException()

    // 2
    await this.userRepository.update({ id: user.id }, { refreshToken: null })
  }

  // 1. Check user exists. If not, create one.
  async createUserDraft(createUserDraftDto: CreateUserDraftDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email: createUserDraftDto.email } })
    if (user) return user

    const newUser = this.userRepository.create(createUserDraftDto)
    return await this.userRepository.save(newUser)
  }
}
