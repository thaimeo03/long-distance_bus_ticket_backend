import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDraftDto } from './dto/create-user-draft.dto'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  // 1. Check user exists. If not, create one.
  async createUserDraft(createUserDraftDto: CreateUserDraftDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email: createUserDraftDto.email } })
    if (user) return user

    const newUser = this.userRepository.create(createUserDraftDto)
    return await this.userRepository.save(newUser)
  }
}
