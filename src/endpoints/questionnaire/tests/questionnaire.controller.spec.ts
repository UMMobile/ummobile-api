import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnaireController } from '../questionnaire.controller';
import { QuestionnaireService } from '../questionnaire.service';

describe('QuestionnaireController', () => {
  let controller: QuestionnaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionnaireController],
      providers: [QuestionnaireService],
    }).compile();

    controller = module.get<QuestionnaireController>(QuestionnaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
