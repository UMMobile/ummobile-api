import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AuthDto } from './entities/authDto.entity';
import { TokenService } from './token.service';

@ApiTags('Auth')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  obtainToken(@Body() auth: AuthDto): Observable<any> {
    return this.tokenService.generateToken(auth);
  }
}
