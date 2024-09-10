import { Test, TestingModule } from '@nestjs/testing'
import { AdminService } from './admin.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { Repository } from 'typeorm'

const mockUserRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
})

describe('AdminService', () => {
  let service: AdminService
  let userRepository: Repository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository // Inject mock repository
        }
      ]
    }).compile()

    service = module.get<AdminService>(AdminService)
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should get all users', async () => {
    const users = [{ id: '1', username: 'testuser', email: 'test@example.com' }]
    userRepository.find.mockResolvedValue(users)

    const result = await service.getAllUsers()
    expect(result).toEqual(users)
    expect(userRepository.find).toHaveBeenCalledTimes(1)
  })

  it('should create a new user', async () => {
    const newUser = { username: 'testuser', password: 'testpass', email: 'test@example.com' }
    userRepository.create.mockReturnValue(newUser)
    userRepository.save.mockResolvedValue(newUser)

    const result = await service.createUser(newUser)
    expect(result).toEqual(newUser)
    expect(userRepository.create).toHaveBeenCalledWith(newUser)
    expect(userRepository.save).toHaveBeenCalledWith(newUser)
  })

  it('should update a user', async () => {
    const updatedData = { username: 'updateduser' }
    userRepository.update.mockResolvedValue(updatedData)

    await service.updateUser('1', updatedData)
    expect(userRepository.update).toHaveBeenCalledWith('1', updatedData)
  })

  it('should delete a user', async () => {
    userRepository.delete.mockResolvedValue({ affected: 1 })

    await service.deleteUser('1')
    expect(userRepository.delete).toHaveBeenCalledWith('1')
  })
})
