import { Test, TestingModule } from '@nestjs/testing';
import { CatalogueController } from './catalogue.controller';
import { CatalogueService } from './catalogue.service';

describe('CatalogueController', () => {
  let controller: CatalogueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogueController],
      providers: [CatalogueService],
    }).compile();

    controller = module.get<CatalogueController>(CatalogueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all the rules', () => {
    expect(controller.findRules({})).toBe(4);
  })
});
