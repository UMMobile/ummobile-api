import { Controller, Get, UseGuards, ForbiddenException, Headers, Put, Body, Post, InternalServerErrorException } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';
import { UpdateCovidInformationDto } from './dto/updateCovidInformation.dto';
import { CovidQuestionnaireAnswerDto } from './dto/createCovidQuestionnaireAnswer.dto';
import { CastError } from 'mongoose';

@Controller('questionnaire')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService, private readonly utils: UtilsService) {}

  @Post('covid')
  @UseGuards(TokenGuard)
  async postCovidQuestionnaireAnswer(
    @Headers('authorization') token: String,
    @Body() covidQuestionnaireAnswerDto: CovidQuestionnaireAnswerDto,
  ) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      try {
        return await this.questionnaireService.saveCovidQuestionnaireAnswer(userId, covidQuestionnaireAnswerDto);
      } catch(e) {
        if(e.name === 'CastError')
          throw new InternalServerErrorException(e['reason']['message']);
      }
    } else throw new ForbiddenException();
  }

  @Get('covid')
  @UseGuards(TokenGuard)
  getCovidQuestionnaire(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.questionnaireService.getCovidQuestionnaireAnswers(userId);
    } else throw new ForbiddenException();
  }

  @Put('covid/extras')
  @UseGuards(TokenGuard)
  putCovidInformation(
    @Headers('authorization') token: String,
    @Body() updateCovidInformationDto: UpdateCovidInformationDto,
  ) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.questionnaireService.updateCovidInformation(userId, updateCovidInformationDto);
    } else throw new ForbiddenException();
  }

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
