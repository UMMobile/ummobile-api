import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './entities/authDto.entity';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  obtainToken(@Body() auth: AuthDto) {
    return this.tokenService.generateToken(auth);
  }
}
