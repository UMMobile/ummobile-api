import { Controller, ForbiddenException, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';
import { AcademicService } from './academic.service';
import { AllSubjectsDto } from './dto/allSubjects.dto';
import { AverageDto } from './dto/average.dto';
import { PlanDto } from './dto/plan.dto';
import { Document } from './entities/document.entity';
import { Semester } from './entities/semester.entity';

@ApiBearerAuth()
@ApiUnauthorizedResponse({description: 'Unauthorized if header does not contains user access token.'})
@ApiForbiddenResponse({description: 'Forbidden if is neither a student or valid token.'})
@ApiTags('Academic')
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService, private readonly utils: UtilsService) {}

  @ApiOperation({
    summary: "Fetches the student documents",
    description: "Fetches the student documents with their images. Images can be `null`.",
  })
  @Get('documents')
  @UseGuards(TokenGuard)
  getDocuments(@Headers() headers: any): Observable<Document[]> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: String = this.utils.getUserId(headers['Authorization']);
      return this.academicService.fetchDocuments(userId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({
    summary: "Fetches all the semesters",
    description: "Fetches all the semesters of the student each one with their subjects.",
  })
  @Get('semesters')
  @UseGuards(TokenGuard)
  getAllSubjects(@Headers() headers: any): Observable<AllSubjectsDto> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.academicService.fetchSemestersWithSubjects(userId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({
    summary: "Fetches the student global average",
    description: "Fetches the student global average but if doesn't have one or an error occurs, a zero is returned.",
  })
  @Get('semesters/average')
  @UseGuards(TokenGuard)
  getGlobalAverage(@Headers() headers: any): Observable<AverageDto> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.academicService.fetchCurrentGlobalAverage(userId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({
    summary: "Fetches the current semester",
    description: "Fetches the current semester of the student with their subjects.",
  })
  @Get('semesters/current')
  @UseGuards(TokenGuard)
  getCurrentSubjects(@Headers() headers: any): Observable<Semester> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.academicService.fetchCurrentSemester(userId);
    } else throw new ForbiddenException();
  }

  @ApiOperation({summary: "Fetches the current plan of the student"})
  @Get('plan')
  @UseGuards(TokenGuard)
  getPlan(@Headers() headers: any): Observable<PlanDto> {
    if(this.utils.isStudent(headers['Authorization'])) {
      const userId: string = this.utils.getUserId(headers['Authorization']);
      return this.academicService.fetchPlan(userId);
    } else throw new ForbiddenException();
  }
}
