import { Controller, Get, Headers } from '@nestjs/common';
import { ForbiddenException } from 'src/exceptions/forbidden.exception';
import { UnauthorizedException, UnauthorizedReasons } from 'src/exceptions/unauthorized.exception';
import { UtilsService } from 'src/utils/utils.service';
import { AcademicService } from './academic.service';

@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService, private readonly utils: UtilsService) {}

  @Get('archives')
  getArchives(@Headers() headers) {
    const token: String = this.utils.getToken(headers);
    if(token) {
      if(this.utils.isStudent(token)) {
        const userId: String = this.utils.getUserId(token);
        return this.academicService.fetchArchives(userId);
      } else throw new ForbiddenException();
    } else throw new UnauthorizedException(UnauthorizedReasons.NoAccessToken);
  }
}
