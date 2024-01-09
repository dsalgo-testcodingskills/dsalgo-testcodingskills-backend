import { Test, TestingModule } from '@nestjs/testing';
import { BaragenessService } from './barageness.service';

describe('BaragenessService', () => {
  let service: BaragenessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaragenessService],
    }).compile();

    service = module.get<BaragenessService>(BaragenessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
