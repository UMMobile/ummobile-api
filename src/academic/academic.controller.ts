import { Controller, ForbiddenException, Get, Headers, UseGuards } from '@nestjs/common';
import { TokenGuard } from 'src/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';
import { AcademicService } from './academic.service';

@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService, private readonly utils: UtilsService) {}

  @Get('archives')
  @UseGuards(TokenGuard)
  getArchives(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchArchives(userId);
    } else throw new ForbiddenException();
  }

  @Get('subjects')
  @UseGuards(TokenGuard)
  getAllSubjects(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchSemestersWithSubjects(userId);
    } else throw new ForbiddenException();
  }

  @Get('subjects/average')
  @UseGuards(TokenGuard)
  getGlobalAverage(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchCurrentGlobalAverage(userId);
    } else throw new ForbiddenException();
  }

  @Get('subjects/current')
  @UseGuards(TokenGuard)
  getCurrentSubjects(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchCurrentSemester(userId);
    } else throw new ForbiddenException();
  }

  @Get('plan')
  @UseGuards(TokenGuard)
  getPlan(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchPlan(userId);
    } else throw new ForbiddenException();
  }
}
