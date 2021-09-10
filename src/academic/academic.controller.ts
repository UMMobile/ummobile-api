import { Controller, ForbiddenException, Get, Headers, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { AcademicService } from './academic.service';

@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService, private readonly utils: UtilsService) {}

  @Get('archives')
  @UseGuards(AuthGuard)
  getArchives(@Headers() headers) {
    const token: String = this.utils.getToken(headers);
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchArchives(userId);
    } else throw new ForbiddenException();
  }

  @Get('subjects')
  @UseGuards(AuthGuard)
  getAllSubjects(@Headers() headers) {
    const token: String = this.utils.getToken(headers);
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchSemestersWithSubjects(userId);
    } else throw new ForbiddenException();
  }

  @Get('subjects/average')
  @UseGuards(AuthGuard)
  getGlobalAverage(@Headers() headers) {
    const token: String = this.utils.getToken(headers);
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchCurrentGlobalAverage(userId);
    } else throw new ForbiddenException();
  }

  @Get('subjects/current')
  @UseGuards(AuthGuard)
  getCurrentSubjects(@Headers() headers) {
    const token: String = this.utils.getToken(headers);
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchCurrentSemester(userId);
    } else throw new ForbiddenException();
  }

  @Get('plan')
  @UseGuards(AuthGuard)
  getPlan(@Headers() headers) {
    const token: String = this.utils.getToken(headers);
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchPlan(userId);
    } else throw new ForbiddenException();
  }
}
