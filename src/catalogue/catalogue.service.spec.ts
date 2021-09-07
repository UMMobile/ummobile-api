import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { Roles } from 'src/statics/roles.enum';
import { rules } from 'src/statics/rules.list';
import { CatalogueService } from './catalogue.service';
import { Country } from './entities/country.entity';
import { Rule } from './entities/rule.entity';

describe('CatalogueService', () => {
  let service: CatalogueService;

  const mockCatalogueService = {
    getRulesFor: jest.fn((role: Roles) => rules.filter(r => r.roles.includes(role))),
    getCountries: jest.fn(() => of([{
        "id": "1",
        "name": "Afganistán"
      },
      {
        "id": "3",
        "name": "Albania"
      },
    ])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatalogueService],
    })
    .overrideProvider(CatalogueService)
    .useValue(mockCatalogueService)
    .compile();

    service = module.get<CatalogueService>(CatalogueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get the rules for students', () => {
    const role: Roles = Roles.Student;
    const rules: Rule[] = service.getRulesFor(role);

    expect(rules.every(rule => rule.roles.includes(role))).toBeTruthy();
  });

  it('should get the rules for employee', () => {
    const role: Roles = Roles.Employee;
    const rules: Rule[] = service.getRulesFor(role);

    expect(rules.every(rule => rule.roles.includes(role))).toBeTruthy();
  });

  it('should get the countries', (done) => {
    service.getCountries().subscribe((countries: Country[]) => {
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
      done();
    });
  });
});
