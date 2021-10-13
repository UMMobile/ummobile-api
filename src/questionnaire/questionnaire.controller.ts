import { Controller, Get, UseGuards, ForbiddenException, Headers, Body, Post, InternalServerErrorException, Patch } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';
import { UpdateCovidInformationDto, UpdatedCovidInformationResDto } from './dto/updateCovidInformation.dto';
import { CovidQuestionnaireAnswerDto } from './dto/createCovidQuestionnaireAnswer.dto';
import { ApiBearerAuth, ApiForbiddenResponse, ApiHeader, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CovidQuestionnaire } from './entities/covidQuestionnaire.entity';
import { Observable } from 'rxjs';
import { CovidInformation, CovidValidation } from './entities/covidInformation.entity';
import { ResponsiveLetterDto } from './dto/responsiveLetter.dto';

@ApiBearerAuth()
@ApiUnauthorizedResponse({description: 'Unauthorized if header does not contains user access token.'})
@ApiForbiddenResponse({description: 'Forbidden if is neither a student or valid token.'})
@ApiTags('Questionnaire')
@Controller('questionnaire')
export class QuestionnaireController {
  constructor(
    private readonly questionnaireService: QuestionnaireService,
    private readonly utils: UtilsService,
  ) {}

  @ApiOperation({summary: "Fetches the user questionnaire covid answers"})
  @Get('covid')
  @UseGuards(TokenGuard)
  getCovidQuestionnaireAnswers(@Headers() headers: any): Promise<CovidQuestionnaire> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.questionnaireService.getCovidQuestionnaireAnswers(userId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({summary: "Fetches the user's COVID questionnaire answers from today"})
  @Get('covid/today')
  @UseGuards(TokenGuard)
  getTodayCovidQuestionnaireAnswers(@Headers() headers: any): Promise<CovidQuestionnaire> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.questionnaireService.getTodayCovidQuestionnaireAnswers(userId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({summary: "Saves an answer of the COVID questionnaire"})
  @Post('covid')
  @UseGuards(TokenGuard)
  postCovidQuestionnaireAnswer(
    @Headers() headers: any,
    @Body() covidQuestionnaireAnswerDto: CovidQuestionnaireAnswerDto,
  ): Observable<CovidValidation> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: String = this.utils.getUserId(headers['Authorization']);
      try {
        return this.questionnaireService.saveCovidQuestionnaireAnswer(userId, covidQuestionnaireAnswerDto);
      } catch(e) {
        if(e.name === 'CastError')
          throw new InternalServerErrorException(e['reason']['message']);
      }
    } else throw new ForbiddenException();
  }

  @ApiOperation({summary: "Updates COVID questionnaire extra information for the user"})
  @Patch('covid/extras')
  @UseGuards(TokenGuard)
  putCovidInformation(
    @Headers() headers: any,
    @Body() updateCovidInformationDto: UpdateCovidInformationDto,
    ): Observable<UpdatedCovidInformationResDto> {
      if(this.utils.isStudent(headers['Authorization'])) {
        const userId: String = this.utils.getUserId(headers['Authorization']);
        return this.questionnaireService.updateCovidInformation(userId, updateCovidInformationDto);
      } else throw new ForbiddenException();
    }
    
  @ApiOperation({summary: "Fetches COVID questionnaire extra information for the user"})
  @Get('covid/extras')
  @UseGuards(TokenGuard)
  getCovidInformation(@Headers() headers: any): Observable<CovidInformation> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: String = this.utils.getUserId(headers['Authorization']);
      return this.questionnaireService.fetchCovidInformation(userId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({summary: "Fetches COVID questionnaire validations for the user"})
  @Get('covid/validate')
  @UseGuards(TokenGuard)
  getCovidValidations(@Headers() headers: any): Observable<CovidValidation> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: String = this.utils.getUserId(headers['Authorization']);
      return this.questionnaireService.fetchCovidValidations(userId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({summary: "Fetches if user uploaded his responsive letter"})
  @Get('covid/responsiveLetter')
  @UseGuards(TokenGuard)
  getIfResponsiveLetter(@Headers() headers: any): Observable<ResponsiveLetterDto> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: String = this.utils.getUserId(headers['Authorization']);
      return this.questionnaireService.fetchIfResponsiveLetter(userId);
    } else throw new ForbiddenException();
  }
}
