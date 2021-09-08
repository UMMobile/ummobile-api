import { Test, TestingModule } from '@nestjs/testing';
import { AcademicService } from '../academic.service';

describe('AcademicService', () => {
  let service: AcademicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcademicService],
    }).compile();

    service = module.get<AcademicService>(AcademicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
