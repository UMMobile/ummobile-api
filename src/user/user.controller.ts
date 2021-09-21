import { Controller, Get, UseGuards, Headers, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenGuard } from 'src/services/guards/token.guard';
import { UtilsService } from 'src/utils/utils.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly utils: UtilsService,
  ) {}

  @Get()
  @UseGuards(TokenGuard)
  getUserData(@Headers('authorization') token: String) {
    const userId: String = this.utils.getUserId(token);
    if(this.utils.isStudent(token))
      return this.userService.fetchUserStudent(userId);
    else if(this.utils.isEmployee(token))
      return this.userService.fetchUserEmployee(userId);
    else throw new ForbiddenException();
  }

  @Get('student')
  @UseGuards(TokenGuard)
  getStudentData(@Headers('authorization') token: String) {
    if(this.utils.isStudent(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.userService.fetchUserStudent(userId);
    }
    else throw new ForbiddenException();
  }

  @Get('employee')
  @UseGuards(TokenGuard)
  getEmployeeData(@Headers('authorization') token: String) {
    if(this.utils.isEmployee(token)) {
      const userId: String = this.utils.getUserId(token);
      return this.userService.fetchUserEmployee(userId);
    }
    else throw new ForbiddenException();
  }
}
