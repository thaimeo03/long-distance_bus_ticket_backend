import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDraftDto } from './dto/create-user-draft.dto'
import { RegisterDto } from './dto/register.dto'
import { AuthService } from 'src/auth/auth.service'
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { ConfigService } from '@nestjs/config'
import { MailsService } from 'src/mails/mails.service'
import { VerifyForgotPasswordOTPDto } from './dto/verify-forgot-password-OTP.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
    private authService: AuthService,
    private mailService: MailsService
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

  // 1. Check email exists
  // 2. Generate OTP with 6 digits and hash it
  // 3. Caching OTP
  // 4. Send email with OTP
  async forgotPassword(email: string) {
    // 1
    const user = await this.userRepository.findOneBy({ email })
    if (!user) throw new NotFoundException('Account is not exist')

    // 2
    const OTP = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOTP = await bcrypt.hash(OTP, 10)

    // 3 & 4
    const KEY = `${email}-forgot-password-otp`
    const TTL = (Number(this.configService.get('USER_FORGOT_PASSWORD_OTP_TTL')) || 2) * 60 * 1000 // TTL default 2 minutes
    await Promise.all([
      await this.cacheManager.set(KEY, hashedOTP, TTL),
      await this.mailService.sendForgotPasswordOTP({ email, OTP, fullName: user.fullName })
    ])
  }

  // 1. Check email exists
  // 2. Get and verify OTP from cache
  // 3. Cache OTP status
  async verifyForgotPasswordOTP(verifyForgotPasswordOTPDto: VerifyForgotPasswordOTPDto) {
    // 1
    const { email, OTP } = verifyForgotPasswordOTPDto
    const user = await this.userRepository.findOneBy({ email })
    if (!user) throw new NotFoundException('Account is not exist')

    // 2
    const KEY1 = `${email}-forgot-password-otp`
    const hashedOTP = await this.cacheManager.get<string>(KEY1)
    if (!hashedOTP) throw new UnauthorizedException('OTP expired')

    const isMatch = await bcrypt.compare(OTP, hashedOTP)
    if (!isMatch) throw new UnauthorizedException('OTP is invalid')

    // 3
    const KEY2 = `${email}-forgot-password-otp-status`
    const TTL = (Number(this.configService.get('USER_FORGOT_PASSWORD_OTP_STATUS_TTL')) || 5) * 60 * 1000 // TTL default 5 minutes
    await Promise.all([await this.cacheManager.del(KEY1), await this.cacheManager.set(KEY2, true, TTL)])
  }

  // 1. Check email exists
  // 2. Get and verify OTP status from cache
  // 3. Hash new password
  // 4. Update new password
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // 1
    const { email, newPassword } = resetPasswordDto
    const user = await this.userRepository.findOneBy({ email })
    if (!user) throw new NotFoundException('Account is not exist')

    // 2
    const KEY = `${email}-forgot-password-otp-status`
    const OTPStatus = await this.cacheManager.get<boolean>(KEY)
    if (!OTPStatus) throw new UnauthorizedException('OTP expired')

    // 3
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 4
    await Promise.all([
      await this.cacheManager.del(KEY),
      await this.userRepository.update({ id: user.id }, { passwordHashed: hashedPassword })
    ])
  }
}
