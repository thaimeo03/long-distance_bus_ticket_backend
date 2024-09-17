import { Test, TestingModule } from '@nestjs/testing';
import { BusCompaniesService } from './bus-companies.service';

describe('BusCompaniesService', () => {
  let service: BusCompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusCompaniesService],
    }).compile();

    service = module.get<BusCompaniesService>(BusCompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
