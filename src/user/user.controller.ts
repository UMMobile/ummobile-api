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
}
