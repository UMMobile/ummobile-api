import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TokenGuard {
  constructor() {}

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();

    if(!request?.headers['authorization']) {
      throw new UnauthorizedException('Authorization header is missing');
    } else {
      // Rename header with authorization from lowerCase to UpperCase
      request.headers['Authorization'] = request.headers['authorization'];
      delete request.headers['authorization'];
    }

    const token: String = request.headers['Authorization'].replace('Bearer ', '');

    if(!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    return true;
  }
}