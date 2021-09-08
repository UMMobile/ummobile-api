import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { Roles } from 'src/statics/roles.enum';
import { rules } from 'src/statics/rules.list';
import { CatalogueService } from '../catalogue.service';
import { Country } from '../entities/country.entity';
import { Rule } from '../entities/rule.entity';

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

  describe('Instantiation', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getRulesFor', () => {
    describe('Students', () => {
      it('should return rules with student role', () => {
        const role: Roles = Roles.Student;
        const rules: Rule[] = service.getRulesFor(role);
    
        expect(rules.every(rule => rule.roles.includes(role))).toBe(true);
      });
    });
  
    describe('Employee', () => {
      it('should return rules with employee role', () => {
        const role: Roles = Roles.Employee;
        const rules: Rule[] = service.getRulesFor(role);
    
        expect(rules.every(rule => rule.roles.includes(role))).toBe(true);
      });
    });
  });

  describe('getCountries', () => {
    it('should return the countries', (done) => {
      service.getCountries().subscribe((countries: Country[]) => {
        expect(Array.isArray(countries)).toBe(true);
        expect(countries.length).toBeGreaterThan(0);
        done();
      });
    });
  });
});
