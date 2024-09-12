import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDraftDto } from './dto/create-user-draft.dto'
import { RegisterDto } from './dto/register.dto'
import { AuthService } from 'src/auth/auth.service'
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private authService: AuthService
  ) {}

  // 1. Check email exists and is not draft
  // 2. Hash password
  // 3. Create user or update user with draft
  // 4. Generate token (access token, refresh token) taken from auth service
  // 5. Save user and return token
  async register(registerDto: RegisterDto) {
    // 1
    let user = await this.userRepository.findOneBy({ email: registerDto.email })

    if (user && !user.isDraft) {
      throw new BadRequestException('Email already exists')
    }

    // 2
    const passwordHash = await bcrypt.hash(registerDto.password, 10)

    if (user && user.isDraft) {
      // 3. Update existing draft user
      user = await this.userRepository.save({
        ...user,
        passwordHashed: passwordHash,
        fullName: registerDto.fullName,
        phoneNumber: registerDto.phoneNumber,
        isDraft: false
      })
    } else {
      // 3. Create a new user if not a draft
      user = this.userRepository.create({
        id: crypto.randomUUID(),
        fullName: registerDto.fullName,
        phoneNumber: registerDto.phoneNumber,
        email: registerDto.email,
        passwordHashed: passwordHash,
        isDraft: false
      })

      await this.userRepository.save(user)
    }

    // 4
    const { accessToken, refreshToken } = await this.authService.generateToken(user.id)

    // 5
    user.refreshToken = refreshToken
    await this.userRepository.save(user)

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

  // 1. Update refresh token is null by user id
  async logout(userId: string) {
    await this.userRepository.update({ id: userId }, { refreshToken: null })
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        fullName: true,
        email: true,
        phoneNumber: true,
        age: true,
        dateOfBirth: true,
        role: true,
        sex: true
      }
    })

    if (!user) throw new NotFoundException('User not found')

    return user
  }

  // 1. Check user exists. If not, create one.
  async createUserDraft(createUserDraftDto: CreateUserDraftDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email: createUserDraftDto.email } })
    if (user) return user

    const newUser = this.userRepository.create(createUserDraftDto)
    return await this.userRepository.save(newUser)
  }

  // 1. Check user exists. If not, throw error
  // 2. Update user
  async updateProfile({ userId, updateUserDto }: { userId: string; updateUserDto: UpdateUserDto }) {
    const user = await this.userRepository.findOneBy({ id: userId })
    if (!user) throw new NotFoundException('User not found')

    await this.userRepository.update(
      { id: userId },
      {
        phoneNumber: updateUserDto.phoneNumber,
        fullName: updateUserDto.fullName,
        age: updateUserDto.age
      }
    )
  }
}
