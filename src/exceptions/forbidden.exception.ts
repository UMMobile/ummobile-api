import { HttpException, HttpStatus } from "@nestjs/common";

export class ForbiddenException extends HttpException {
  constructor() {
    super('User does not have access to this resource', HttpStatus.FORBIDDEN);
  }
}