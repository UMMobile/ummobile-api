import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AxiosError } from 'axios';
import { Observable, of } from 'rxjs';
import { Residence } from 'src/statics/residence.enum';
import { Roles } from 'src/statics/roles.enum';

@Injectable()
export class UtilsService {
  constructor(private jwt: JwtService) {}

  /**
   * Extract the user id from a token. If token is `undefined` then the returned value is an empty string.
   * @param token The token to extract the user id
   * @return The user id or empty string
   */
  getUserId(token: String | undefined): String {
    if(!token) return '';
    token = this.removeBearer(token);

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
   * @return The role
   */
  getRoleFromToken(token: String | undefined): Roles {
    if(!token) return Roles.Unknown;
    token = this.removeBearer(token);

    const userId: String = this.getUserId(token);
    return this.role(userId);
  }

  /**
   * Get the role from the user Id.
   * @param userId The user Id
   * @return The role
   */
  getRoleFromId = (userId: String): Roles => this.role(userId);

  /**
   * Check if the token owner have a `Student` role.
   * @param token The token
   * @return `true` or `false`
   */
  isStudent = (token: String): Boolean => this.getRoleFromToken(token) === Roles.Student;

  /**
   * Check if the token owner have a `Employee` role.
   * @param token The token
   * @return `true` or `false`
   */
  isEmployee = (token: String): Boolean => this.getRoleFromToken(token) === Roles.Employee;

  /**
   * Get the role from the user Id.
   * @param userId The user id
   * @return The user role
   */
  private role = (userId: String):Roles => {
    if(userId.startsWith('0') || userId.startsWith('1')) {
      return Roles.Student;
    } else if(userId.startsWith('9')) {
      return Roles.Employee;
    } else {
      return Roles.Unknown;
    }
  }

  /** 
   * Removes the "Bearer " part of the authorization header string.
   * @param token The authorization header string
   * @return The isolated token
   */
  removeBearer = (token: String): String => token.replace('Bearer ', '');

  /** 
   * Parse a new Date from an unformatted String date with the format: `dd/mm/yyyy` or `dd-mm-yyyy`.
   * @param unformatDate The unformatted date string
   * @return The parsed Date or `undefined` if cannot format.
   */
  parseDDMMYYYY(unformatDate: String): Date | undefined {
    let dateParts: number[];
    
    if(!unformatDate) return;
    else if(unformatDate.includes('/'))
      dateParts = unformatDate.split("/").map(s => Number.parseInt(s));
    else if(unformatDate.includes('-'))
      dateParts = unformatDate.split("-").map(s => Number.parseInt(s));
    else return;

    if(dateParts.length < 3 || dateParts[0] > 31) return;
    
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
  }

  /** 
   * Return true if the `date` is before today (`this.today()`).
   * 
   * The validation is done comparing the time (`Date.getTime()`) of both dates.
   * @param date The date to compare
   * @return `True` if is before. Otherwise `False`.
   */
  isBeforeToday(date: Date): Boolean {
    return date.getTime() < this.today().getTime();
  }

  /** 
   * Return true if `nthDays` or more had passed between the `date` and today (`this.today()`).
   * 
   * The validation is done using `this.isBeforeToday()` passing the `date` after the `nthDays` were added to it.
   * @param date The start date
   * @return `True` nth days has passed. Otherwise `False`.
   */
  nthDaysPassed(date: Date, nthDays: number): Boolean {
    const afterDate: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    afterDate.setDate(date.getDate() + nthDays);
    return this.isBeforeToday(afterDate);
  }

  /** 
   * Return `true` if the passed date is still today (`this.today()`).
   * 
   * The validation is done comparing the year, month and day-of-month of the `date` and today (`this.today()`).
   * @return `true` if is today. Otherwise `false`.
   */
   isStillToday = (date: Date): Boolean =>
    date.getFullYear() === this.today().getFullYear() &&
    date.getMonth() === this.today().getMonth() &&
    date.getDate() === this.today().getDate();

  /** 
   * Get the today date without the current time.
   * @return The today Date
   */
  today(): Date {
    const t: Date = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }

  /** 
   * Format from String to residence type.
   * @param residence The residence string
   * @return The Residence type
   */
  fromStringToResidence(residence: String): Residence {
    console.log(residence);
    switch (residence) {
      case 'EXTERNO':
        return Residence.External;
      case 'INTERNO':
        return Residence.Internal;
      default:
        return Residence.Unknown;
    }
  }

  /** 
   * Handle HTTP call errors.
   * @return An Observable with the `result` parameter
   */
  handleHttpError<T>(result?: T, options: {messageIfNotFound: String} = {messageIfNotFound: ''}) {
    return (error: AxiosError<any>): Observable<T> => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        if(error.response.status === 404) {
          throw new NotFoundException(options.messageIfNotFound);
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
  
      return of(result as T);
    }
  }
}
