import { Controller, ForbiddenException, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';
import { AcademicService } from './academic.service';
import { AllSubjectsDto } from './dto/allSubjects.dto';
import { AverageDto } from './dto/average.dto';
import { PlanDto } from './dto/plan.dto';
import { Archive } from './entities/archives.entity';
import { Semester } from './entities/semester.entity';

@ApiBearerAuth()
@ApiHeader({
  name: 'authorization',
  description: 'Override the endpoint auth. Is required if, and only if, the endpoint is not authenticated and will return 401.',
  required: false,
})
@ApiTags('Academic')
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService, private readonly utils: UtilsService) {}

  @Get('archives')
  @UseGuards(TokenGuard)
  getArchives(@Headers('authorization') token: String): Observable<Archive[]> {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.academicService.fetchArchives(userId);
    } else throw new ForbiddenException();
  }

  @Get('subjects')
  @UseGuards(TokenGuard)
  getAllSubjects(@Headers('authorization') token: String): Observable<AllSubjectsDto> {
    if(this.utils.isStudent(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.academicService.fetchSemestersWithSubjects(userId);
    } else throw new ForbiddenException();
  }

  @Get('subjects/average')
  @UseGuards(TokenGuard)
  getGlobalAverage(@Headers('authorization') token: String): Observable<AverageDto> {
    if(this.utils.isStudent(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.academicService.fetchCurrentGlobalAverage(userId);
    } else throw new ForbiddenException();
  }

  @Get('subjects/current')
  @UseGuards(TokenGuard)
  getCurrentSubjects(@Headers('authorization') token: String): Observable<Semester> {
    if(this.utils.isStudent(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.academicService.fetchCurrentSemester(userId);
    } else throw new ForbiddenException();
  }

  @Get('plan')
  @UseGuards(TokenGuard)
  getPlan(@Headers('authorization') token: String): Observable<PlanDto> {
    if(this.utils.isStudent(token)) {
      const userId: string = this.utils.getUserId(token);
      return this.academicService.fetchPlan(userId);
    } else throw new ForbiddenException();
  }
}
