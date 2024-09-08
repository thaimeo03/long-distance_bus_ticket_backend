import { Test, TestingModule } from '@nestjs/testing'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { UpdateUserDto } from '../users/dto/update-user.dto'

describe('AdminController', () => {
  let controller: AdminController
  let service: AdminService

  const mockAdminService = {
    getAllUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService // Inject mock service
        }
      ]
    }).compile()

    controller = module.get<AdminController>(AdminController)
    service = module.get<AdminService>(AdminService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return all users', async () => {
    const users = [{ id: '1', username: 'testuser', email: 'test@example.com' }]
    mockAdminService.getAllUsers.mockResolvedValue(users)

    const result = await controller.getAllUsers()
    expect(result).toEqual(users)
    expect(service.getAllUsers).toHaveBeenCalledTimes(1)
  })

  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      phoneNumber: '123456789',
      age: 25,
      password: 'password',
      email: 'test@example.com',
      sex: 1
    }
    mockAdminService.createUser.mockResolvedValue(createUserDto)

    const result = await controller.createUser(createUserDto)
    expect(result).toEqual(createUserDto)
    expect(service.createUser).toHaveBeenCalledWith(createUserDto)
  })

  it('should update a user', async () => {
    const updateUserDto: UpdateUserDto = { username: 'updateduser' }
    mockAdminService.updateUser.mockResolvedValue(updateUserDto)

    await controller.updateUser('1', updateUserDto)
    expect(service.updateUser).toHaveBeenCalledWith('1', updateUserDto)
  })

  it('should delete a user', async () => {
    await controller.deleteUser('1')
    expect(service.deleteUser).toHaveBeenCalledWith('1')
  })
})
