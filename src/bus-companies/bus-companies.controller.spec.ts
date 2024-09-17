import { Test, TestingModule } from '@nestjs/testing';
import { BusCompaniesController } from './bus-companies.controller';

describe('BusCompaniesController', () => {
  let controller: BusCompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusCompaniesController],
    }).compile();

    controller = module.get<BusCompaniesController>(BusCompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
