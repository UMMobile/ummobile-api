import { Controller, Get, UseGuards, ForbiddenException, Headers } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';

@Controller('questionnaire')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService, private readonly utils: UtilsService) {}

  @Get('covid/extras')
  @UseGuards(TokenGuard)
  getCovidInformation(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.questionnaireService.fetchCovidInformation(userId);
    } else throw new ForbiddenException();
  }

  @Get('covid/validate')
  @UseGuards(TokenGuard)
  getCovidValidations(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.questionnaireService.fetchCovidValidations(userId);
    } else throw new ForbiddenException();
  }

  @Get('covid/responsiveLetter')
  @UseGuards(TokenGuard)
  getIfResponsiveLetter(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.questionnaireService.fetchIfResponsiveLetter(userId);
    } else throw new ForbiddenException();
  }
}
