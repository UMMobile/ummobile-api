import { HttpException, HttpStatus } from "@nestjs/common";

export enum UnauthorizedReasons {
  NoAccessToken,
}

export class UnauthorizedException extends HttpException {
  constructor(reason: UnauthorizedReasons) {
    let message: String = 'Unauthorized';

    if(reason === UnauthorizedReasons.NoAccessToken) {
      message = 'Access token is missing';
    }

    super(message, HttpStatus.UNAUTHORIZED);
  }
}