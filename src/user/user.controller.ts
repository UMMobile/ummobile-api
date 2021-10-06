import { Controller, Get, UseGuards, Headers, ForbiddenException, Query, DefaultValuePipe, ParseBoolPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';
import { ApiBearerAuth, ApiForbiddenResponse, ApiHeader, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { User } from './entities/user.entity';
import { Base64Dto } from './dto/base64.dto';

@ApiBearerAuth()
@ApiUnauthorizedResponse({description: 'Unauthorized if header does not contains user access token.'})
@ApiForbiddenResponse({description: 'Forbidden if is neither a student, teacher or valid token.'})
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly utils: UtilsService,
  ) {}

  @ApiOperation({
    summary: "Fetches the user information",
    description: "The fields of the returned object may vary depending on the user type. If the user is a student it will have some different fields than if the user is an employee. Also, if the profile image also needs to be retrieved, it must be specified with the `includePicture` query parameter.",
  })
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
    @Headers() headers: any,
    @Query('includePicture', new DefaultValuePipe(false), ParseBoolPipe) includePicture: boolean,
  ): Observable<User> {
    const userId: String = this.utils.getUserId(headers['Authorization']);
    if(this.utils.isStudent(headers['Authorization']))
      return this.userService.fetchUserStudent(userId, {includePicture});
    else if(this.utils.isEmployee(headers['Authorization']))
      return this.userService.fetchUserEmployee(userId, {includePicture});
    else throw new ForbiddenException();
  }

  @ApiOperation({
    summary: "Fetches the user student information",
    description: "This endpoint only work for users students. If the user is not a student will response with `403`. Also, if the profile image also needs to be retrieved, it must be specified with the `includePicture` query parameter.",
  })
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
    @Headers() headers: any,
    @Query('includePicture', new DefaultValuePipe(false), ParseBoolPipe) includePicture: boolean,
  ): Observable<User> {
    const userId: String = this.utils.getUserId(headers['Authorization']);
    if(this.utils.isStudent(headers['Authorization'])) {
      return this.userService.fetchUserStudent(userId, {includePicture});
    }
    else throw new ForbiddenException(`The user ${userId} is not a student`);
  }

  @ApiOperation({
    summary: "Fetches the user employee information",
    description: "This endpoint only work for users employee. If the user is not an employee will response with `403`. Also, if the profile image also needs to be retrieved, it must be specified with the `includePicture` query parameter.",
  })
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
    @Headers() headers: any,
    @Query('includePicture', new DefaultValuePipe(false), ParseBoolPipe) includePicture: boolean,
  ): Observable<User> {
    const userId: String = this.utils.getUserId(headers['Authorization']);
    if(this.utils.isEmployee(headers['Authorization'])) {
      return this.userService.fetchUserEmployee(userId, {includePicture});
    }
    else throw new ForbiddenException(`The user ${userId} is not an employee`);
  }

  @ApiOperation({summary: "Fetches the user profile picture"})
  @Get('picture')
  @UseGuards(TokenGuard)
  getPicture(@Headers() headers: any): Observable<Base64Dto> {
    const userId: String = this.utils.getUserId(headers['Authorization']);
    if(this.utils.isStudent(headers['Authorization']))
      return this.userService.fetchStudentPicture(userId);
    else if(this.utils.isEmployee(headers['Authorization']))
      return this.userService.fetchEmployeePicture(userId);
    else throw new ForbiddenException();
  }
}
