import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TokenGuard {
  constructor() {}

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();

    if(!request?.headers['authorization']) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token: String = request.headers['authorization'].replace('Bearer ', '');

    if(!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    return true;
  }
}