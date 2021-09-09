import { Injectable, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/statics/roles.enum';

@Injectable()
export class UtilsService {
  constructor(private jwt: JwtService) {}

  /**
   * Extract the user id from a token. If token is `undefined` then the returned value is an empty string.
   * @param token The token to extract the user id
   * @return The user id
   */
  getUserId(token: String | undefined): String {
    if(!token) return '';

    const decoded = this.jwt.decode(token.toString());

    if(decoded) {
      return decoded.sub.split('@')[0];
    } else return '';
  }

  /**
   * Extract the token from the headers. If token is not presented the `undefined` is returned.
   * @param headers The request header
   * @return The token or `undefined`
   */
  getToken(headers: {}): String | undefined {
    return headers['authorization']?.replace('Bearer ', '');
  }

  /**
   * Extract the role from the token. If token `undefined` the role returned is `Unknown`.
   * @param token The token
   * @return The token or `undefined`
   */
  getRoleFromToken(token: String | undefined): Roles {
    if(!token) return Roles.Unknown;

    const userId: String = this.getUserId(token);
    return this.role(userId);
  }

  /**
   * Check if the token owner have a `Student` role.
   * @param token The token
   * @return `true` or `false`
   */
  isStudent = (token: String):Boolean => this.getRoleFromToken(token) === Roles.Student;

  /**
   * Get the role from the user Id.
   * @param userId The user id
   * @return The user role
   */
  role = (userId: String):Roles => {
    if(userId.startsWith('0') || userId.startsWith('1')) {
      return Roles.Student;
    } else if(userId.startsWith('9')) {
      return Roles.Employee;
    } else {
      return Roles.Unknown;
    }
  }
}
