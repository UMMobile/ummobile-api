import { Test, TestingModule } from '@nestjs/testing';
import { CatalogueService } from './catalogue.service';

describe('CatalogueService', () => {
  let service: CatalogueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatalogueService],
    }).compile();

    service = module.get<CatalogueService>(CatalogueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
