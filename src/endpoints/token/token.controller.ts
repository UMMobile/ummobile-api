import { Body, Controller, DefaultValuePipe, ParseBoolPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AuthDto } from './entities/authDto.entity';
import { TokenService } from './token.service';

@ApiTags('Auth')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @ApiOperation({
    summary: "Obtains a new token",
    description: "Obtains an schema containing an `access_token`. The access token is the one that is required for the secured endpoints of this API.",
  })
  @Post()
  obtainToken(
    @Body() auth: AuthDto,
    @Query('sandbox', new DefaultValuePipe(false), ParseBoolPipe) sandbox: boolean,
  ): Observable<any> {
    return this.tokenService.generateToken(auth, {scope: 'openId'}, {sandbox, grantType: 'password'});
  }
}
