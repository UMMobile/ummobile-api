import { Test, TestingModule } from '@nestjs/testing';
import { AcaAuthService } from '../acaAuth.service';
import { of } from 'rxjs';

describe('LoginService', () => {
  let service: AcaAuthService;

  const mockAcaAuthService = {
    token: jest.fn(() => of('X')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcaAuthService],
    })
    .overrideProvider(AcaAuthService)
    .useValue(mockAcaAuthService)
    .compile();

    service = module.get<AcaAuthService>(AcaAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get a token', (done) => {
    const token: String = 'BearereyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJVTUpXVCIsInN1YiI6Im1vdmlsIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9NT1ZJTCJdLCJpYXQiOjE2MzEwMzM2MjcsImV4cCI6MTYzMTAzNzIyN30.Htwc17nrSfX-3NInQpDg-rznbwkMhRpDVXaplUJt7pDsXmlGsXznMXZDKtKAKXjleZHVsfKNKK_zpRSum7HYIw';
    jest.spyOn(service, 'token').mockImplementationOnce(() => of(token));

    service.token().subscribe(resToken => {
      expect(resToken).toBe(token);
      done();
    });
  });

  it('should get error value', (done) => {
    service.token().subscribe(resToken => {
      expect(resToken).toBe('X');
      done();
    });
  });
});
