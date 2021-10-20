import { Test, TestingModule } from '@nestjs/testing';
import { FinancialController } from '../financial.controller';
import { FinancialService } from '../financial.service';

describe('FinancialController', () => {
  let controller: FinancialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialController],
      providers: [FinancialService],
    }).compile();

    controller = module.get<FinancialController>(FinancialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
