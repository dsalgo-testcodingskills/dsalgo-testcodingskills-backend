import { Test, TestingModule } from '@nestjs/testing';
import { BaragenessController } from './barageness.controller';

describe('BaragenessController', () => {
  let controller: BaragenessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaragenessController],
    }).compile();

    controller = module.get<BaragenessController>(BaragenessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
