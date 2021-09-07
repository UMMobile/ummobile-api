import { Injectable, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/statics/roles.enum';

@Injectable()
export class UtilsService {
  constructor(private jwt: JwtService) {}

  getUserId(token: String | undefined): String {
    if(!token) return '';

    const sub: String = this.jwt.decode(token.toString()).sub;
    return sub.split('@')[0];
  }

  getToken(headers: {}): String | undefined {
    return headers['authorization']?.replace('Bearer ', '');
  }

  getRoleFromToken(token: String | undefined): Roles {
    if(!token) return Roles.Unknown;

    const userId: String = this.getUserId(token);
    return this.role(userId);
  }

  role = (userId: String) => {
    if(userId.startsWith('0') || userId.startsWith('1')) {
      return Roles.Student;
    } else if(userId.startsWith('9')) {
      return Roles.Employee;
    } else {
      return Roles.Unknown;
    }
  }
}
