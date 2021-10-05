import { Controller, Get, UseGuards, Headers, ForbiddenException, Query, DefaultValuePipe, ParseBoolPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';
import { ApiBearerAuth, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { User } from './entities/user.entity';
import { Base64Dto } from './dto/base64.dto';

@ApiBearerAuth()
@ApiHeader({
  name: 'authorization',
  description: 'Override the endpoint auth. Is required if endpoint is not authenticated and will return 401.',
  required: false,
})
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly utils: UtilsService,
  ) {}

  @ApiQuery({
    name: 'includePicture',
    description: 'Set to `true` to include the user picture.',
    required: false,
    schema: {
      default: false,
      type: 'boolean',
    }
  })
  @Get()
  @UseGuards(TokenGuard)
  getUserData(
    @Headers('authorization') token: String,
    @Query('includePicture', new DefaultValuePipe(false), ParseBoolPipe) includePicture: boolean,
  ): Observable<User> {
    const userId: String = this.utils.getUserId(token);
    if(this.utils.isStudent(token))
      return this.userService.fetchUserStudent(userId, {includePicture});
    else if(this.utils.isEmployee(token))
      return this.userService.fetchUserEmployee(userId, {includePicture});
    else throw new ForbiddenException();
  }

  @ApiQuery({
    name: 'includePicture',
    description: 'Set to `true` to include the user picture.',
    required: false,
    schema: {
      default: false,
      type: 'boolean',
    }
  })
  @Get('student')
  @UseGuards(TokenGuard)
  getStudentData(
    @Headers('authorization') token: String,
    @Query('includePicture', new DefaultValuePipe(false), ParseBoolPipe) includePicture: boolean,
  ): Observable<User> {
    const userId: String = this.utils.getUserId(token);
    if(this.utils.isStudent(token)) {
      return this.userService.fetchUserStudent(userId, {includePicture});
    }
    else throw new ForbiddenException(`The user ${userId} is not a student`);
  }

  @ApiQuery({
    name: 'includePicture',
    description: 'Set to `true` to include the user picture.',
    required: false,
    schema: {
      default: false,
      type: 'boolean',
    }
  })
  @Get('employee')
  @UseGuards(TokenGuard)
  getEmployeeData(
    @Headers('authorization') token: String,
    @Query('includePicture', new DefaultValuePipe(false), ParseBoolPipe) includePicture: boolean,
  ): Observable<User> {
    const userId: String = this.utils.getUserId(token);
    if(this.utils.isEmployee(token)) {
      return this.userService.fetchUserEmployee(userId, {includePicture});
    }
    else throw new ForbiddenException(`The user ${userId} is not an employee`);
  }

  @Get('picture')
  @UseGuards(TokenGuard)
  getPicture(@Headers('authorization') token: String): Observable<Base64Dto> {
    const userId: String = this.utils.getUserId(token);
    if(this.utils.isStudent(token))
      return this.userService.fetchStudentPicture(userId);
    else if(this.utils.isEmployee(token))
      return this.userService.fetchEmployeePicture(userId);
    else throw new ForbiddenException();
  }
}
