import { Test, TestingModule } from '@nestjs/testing';
import { Roles } from 'src/statics/roles.enum';
import { UtilsModule } from './utils.module';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UtilsModule],
    }).compile();

    service = module.get<UtilsService>(UtilsService);
  });

  describe('Token manipulation', () => {
    const studentId: String = '1130745';
    const employeeId: String = '9830438';
    const studentToken: String = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik5UZG1aak00WkRrM05qWTBZemM1TW1abU9EZ3dNVEUzTVdZd05ERTVNV1JsWkRnNE56YzRaQT09In0.eyJhdWQiOiJodHRwOlwvXC9vcmcud3NvMi5hcGltZ3RcL2dhdGV3YXkiLCJzdWIiOiIxMTMwNzQ1QHVtLm1vdmlsIiwiYXBwbGljYXRpb24iOnsib3duZXIiOiJsYWZ1ZW50ZUB1bS5tb3ZpbCIsInRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJ0aWVyIjoiVW5saW1pdGVkIiwibmFtZSI6IkRlZmF1bHRBcHBsaWNhdGlvbiIsImlkIjozLCJ1dWlkIjpudWxsfSwic2NvcGUiOiJvcGVuaWQiLCJpc3MiOiJodHRwczpcL1wvd3NvMmlzLnVtLmVkdS5teDo5NDQ0XC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiVW5saW1pdGVkIjp7InRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJzdG9wT25RdW90YVJlYWNoIjp0cnVlLCJzcGlrZUFycmVzdExpbWl0IjowLCJzcGlrZUFycmVzdFVuaXQiOm51bGx9fSwia2V5dHlwZSI6IlBST0RVQ1RJT04iLCJzdWJzY3JpYmVkQVBJcyI6W3sic3Vic2NyaWJlclRlbmFudERvbWFpbiI6InVtLm1vdmlsIiwibmFtZSI6IkFjYWRlbWljbyIsImNvbnRleHQiOiJcL2FjYWluZm9cL1YxLjAuMCIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6IlYxLjAuMCIsInN1YnNjcmlwdGlvblRpZXIiOiJVbmxpbWl0ZWQifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJ1bS5tb3ZpbCIsIm5hbWUiOiJWUkZFZG9DdGFVTSIsImNvbnRleHQiOiJcL3VtZmluXC8xLjAiLCJwdWJsaXNoZXIiOiJsYWZ1ZW50ZS5kYW5pZWwiLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IlVubGltaXRlZCJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6InVtLm1vdmlsIiwibmFtZSI6InB1c2hub3RpZmljYXRpb25zIiwiY29udGV4dCI6IlwvcG5zeXNcLzEuMC4wIiwicHVibGlzaGVyIjoiam9uYXRoYW5nb216IiwidmVyc2lvbiI6IjEuMC4wIiwic3Vic2NyaXB0aW9uVGllciI6IlVubGltaXRlZCJ9XSwiY29uc3VtZXJLZXkiOiJ0Z2ZZYnd3b3VwcXFfOUJtRmd3cG5neE56VHNhIiwiZXhwIjoxNjMxMDQwMTcwLCJpYXQiOjE2MzEwMzY1NzAsImp0aSI6IjViYTQ5YmFhLWNjMmMtNDkwMi1iOWNlLWUwNTU4MTM2YWU1OCJ9.pF6s1jPTabSRWOKZG7qWuEgZf2LVTxOA6w6O547UVxqCNA7U-ejv8zQRmFN6PMd-HBNtbmJYcZZNz6v3e5wkSNefT3kzvZuYoTIqLe4slBbadL540ztK-dCnLnr-cu9qrtS3gpA0dn5QxYag1Zz2m9cCAmwn_-1ZMN9x7eljAiyAW1tXp8r2wGWP6uV2UdWFi1oS5gIM2wijObuLBWHvq9OvJ0dEiT2NniSRijZBKQT_n6FzUaRvJHcDqQBbQ5QVioxf9gC-VwN9eivHfEiYH0rhprreKzXP2fa47krS_NozDWwF3hrRg9lKvn8maeJYxsDnF5w_BK1BB1tGXq86Sg';
    const employeeToken: String = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik5UZG1aak00WkRrM05qWTBZemM1TW1abU9EZ3dNVEUzTVdZd05ERTVNV1JsWkRnNE56YzRaQT09In0.eyJhdWQiOiJodHRwOlwvXC9vcmcud3NvMi5hcGltZ3RcL2dhdGV3YXkiLCJzdWIiOiI5ODMwNDM4QHVtLm1vdmlsIiwiYXBwbGljYXRpb24iOnsib3duZXIiOiJsYWZ1ZW50ZUB1bS5tb3ZpbCIsInRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJ0aWVyIjoiVW5saW1pdGVkIiwibmFtZSI6IkRlZmF1bHRBcHBsaWNhdGlvbiIsImlkIjozLCJ1dWlkIjpudWxsfSwic2NvcGUiOiJvcGVuaWQiLCJpc3MiOiJodHRwczpcL1wvd3NvMmlzLnVtLmVkdS5teDo5NDQ0XC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiVW5saW1pdGVkIjp7InRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJzdG9wT25RdW90YVJlYWNoIjp0cnVlLCJzcGlrZUFycmVzdExpbWl0IjowLCJzcGlrZUFycmVzdFVuaXQiOm51bGx9fSwia2V5dHlwZSI6IlBST0RVQ1RJT04iLCJzdWJzY3JpYmVkQVBJcyI6W3sic3Vic2NyaWJlclRlbmFudERvbWFpbiI6InVtLm1vdmlsIiwibmFtZSI6IkFjYWRlbWljbyIsImNvbnRleHQiOiJcL2FjYWluZm9cL1YxLjAuMCIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6IlYxLjAuMCIsInN1YnNjcmlwdGlvblRpZXIiOiJVbmxpbWl0ZWQifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJ1bS5tb3ZpbCIsIm5hbWUiOiJWUkZFZG9DdGFVTSIsImNvbnRleHQiOiJcL3VtZmluXC8xLjAiLCJwdWJsaXNoZXIiOiJsYWZ1ZW50ZS5kYW5pZWwiLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IlVubGltaXRlZCJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6InVtLm1vdmlsIiwibmFtZSI6InB1c2hub3RpZmljYXRpb25zIiwiY29udGV4dCI6IlwvcG5zeXNcLzEuMC4wIiwicHVibGlzaGVyIjoiam9uYXRoYW5nb216IiwidmVyc2lvbiI6IjEuMC4wIiwic3Vic2NyaXB0aW9uVGllciI6IlVubGltaXRlZCJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6InVtLm1vdmlsIiwibmFtZSI6IlVNTW9iaWxlQVBJIiwiY29udGV4dCI6IlwvdW1tb2JpbGVcL3YxIiwicHVibGlzaGVyIjoiam9uYXRoYW5nb216IiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IlVubGltaXRlZCJ9XSwiY29uc3VtZXJLZXkiOiJ0Z2ZZYnd3b3VwcXFfOUJtRmd3cG5neE56VHNhIiwiZXhwIjoxNjMyMTgxMDY3LCJpYXQiOjE2MzIxNzc0NjcsImp0aSI6IjA5OTE5Mzc0LWMxNTgtNDVjOC05ZTAxLTgxODU2ZDM1OTlmZiJ9.FERJa2-cDrHuQGJGMi2pq8394vUnMuF5Ffh1GxliMJudwmWnjsX3PyATRrb3SMIFZY_S_cClHJFNBpB-_J_uc5ImDaCimIxT3tr9ENpDe3x2Vj04bd8CfWr5tePi5qunBT6l-zkF8W3vo2I59h43z5UjThfhB2g8atnFmx8lD2vLeZw-GG8K0CANhHF0_mM73Y4trssB7BI_oTx6LCxV0uHfNPjVRJgkoqSgdiZy7Gvb-DhqwJjLq3Bv1BEYuyuzwfIJtDe1LJgRxk5qk_Tj-JUIcGBqPvLqylQVrI4MWs6_mYlrMUJ7HHA43VkvqlUS-I-8WgUL_nVGW21H9ogcPg';
    const headers = {authorization: studentToken};
    
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    describe('getUserId', () => {
      it('should get the user Id', () => {
        expect(service.getUserId(studentToken)).toBe(studentId);
      });
  
      it('should return empty String for undefined', () => {
        expect(service.getUserId(undefined)).toBe('');
      });
    });
  
    describe('getToken', () => {
      it('should get the token from headers', () => {
        expect(service.getToken(headers)).toBe(studentToken.replace('Bearer ', ''));
      });

      it('should get undefined if token not present', () => {
        delete headers['authorization'];
        expect(service.getToken(headers)).toBeUndefined();
      });
    });

    describe('getRoleFromToken', () => {
      it('should get the role Student', () => {
        expect(service.getRoleFromToken(studentToken)).toBe(Roles.Student);
      });

      it('should get the role Employee', () => {
        expect(service.getRoleFromToken(employeeToken)).toBe(Roles.Employee);
      });

      it('should get the role Unknown', () => {
        expect(service.getRoleFromToken(undefined)).toBe(Roles.Unknown);
      });
    });

    describe('getRoleFromId', () => {
      it('should get the role Student', () => {
        expect(service.getRoleFromId(studentId)).toBe(Roles.Student);
      });

      it('should get the role Employee', () => {
        expect(service.getRoleFromId(employeeId)).toBe(Roles.Employee);
      });

      it('should get the role Unknown', () => {
        expect(service.getRoleFromId('jonathangomz')).toBe(Roles.Unknown);
      });
    });

    describe('isStudent & isEmployee', () => {
      it('should check if token is from student user', () => {
        expect(service.isStudent(studentToken)).toBe(true);
        expect(service.isStudent(employeeId)).toBe(false);
      });
  
      it('should check if token is from employee user', () => {
        expect(service.isEmployee(employeeToken)).toBe(true);
        expect(service.isEmployee(studentToken)).toBe(false);
      });
    });

    describe('removeBearer', () => {
      it('should remove the bearer from the authorization header string', () => {
        expect(service.removeBearer(studentToken)).toBe(studentToken.replace('Bearer ', ''));
        expect(service.removeBearer(employeeToken)).toBe(employeeToken.replace('Bearer ', ''));
      });
    });
  });

  describe('Dates manipulation', () => {
    describe('parseDDMMYYYY', () => {
      it('should parse a new Date with dd/mm/yyyy format', () => {
        expect(service.parseDDMMYYYY('23/10/2015')).toStrictEqual(new Date(2015, 10 - 1, 23));
      });

      it('should parse a new Date with dd-mm-yyyy format', () => {
        expect(service.parseDDMMYYYY('23-10-2015')).toStrictEqual(new Date(2015, 10 - 1, 23));
      });

      it('should return undefined for no supported format', () => {
        expect(service.parseDDMMYYYY('2015-10-23')).toBeUndefined();
      });
    });

    describe('isBeforeToday', () => {
      let date: Date;

      beforeEach(() => {
        date = service.today();
      });

      it('should be true for yesterday', () => {
        date.setDate(date.getDate() - 1);
        expect(service.isBeforeToday(date)).toBe(true);
      });
  
      it('should be false for today', () => {
        expect(service.isBeforeToday(date)).toBe(false);
      });

      it('should be false for tomorrow', () => {
        date.setDate(date.getDate() + 1);
        expect(service.isBeforeToday(date)).toBe(false);
      });
    });

    describe('nthDaysPassed: 2 days', () => {
      const nthDays: number = 2;
      let date: Date;

      beforeEach(() => {
        date = service.today();
      });

      it('should be false for today', () => {
        expect(service.nthDaysPassed(date, nthDays)).toBe(false);
      });

      it('should be false for yesterday', () => {
        date.setDate(date.getDate() - 1);
        expect(service.nthDaysPassed(date, nthDays)).toBe(false);
      });

      it('should be false for exact nth days', () => {
        date.setDate(date.getDate() - 2);
        expect(service.nthDaysPassed(date, nthDays)).toBe(false);
      });

      it('should be true for more than the nth days', () => {
        date.setDate(date.getDate() - 3);
        expect(service.nthDaysPassed(date, nthDays)).toBe(true);
      });
    });

    describe('today', () => {
      it('should get a today Date without time', () => {
        const today: Date = service.today();
        const expected: Date = new Date();
        expect(today.getFullYear()).toBe(expected.getFullYear());
        expect(today.getMonth()).toBe(expected.getMonth());
        expect(today.getDate()).toBe(expected.getDate());
        expect(today.getHours()).toBe(0);
        expect(today.getMinutes()).toBe(0);
        expect(today.getSeconds()).toBe(0);
        expect(today.getMilliseconds()).toBe(0);
      });
    });
  });
});
