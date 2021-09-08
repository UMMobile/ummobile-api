import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';
import { Roles } from 'src/statics/roles.enum';
import { rules } from 'src/statics/rules.list';
import { UtilsModule } from 'src/utils/utils.module';
import { CatalogueController } from '../catalogue.controller';
import { CatalogueService } from '../catalogue.service';
import { Country } from '../entities/country.entity';
import { Rule } from '../entities/rule.entity';
import { countriesStub } from './stubs/countries.stub';

jest.mock('../catalogue.service');

describe('CatalogueController', () => {
  let controller: CatalogueController;
  let service: CatalogueService;

  const mockCatalogueService = {
    filterRulesFor: jest.fn().mockImplementation((role: Roles): Rule[] => rules.filter(r => r.roles.includes(role))),
    fetchCountries: jest.fn().mockReturnValue(of(countriesStub())),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UtilsModule],
      controllers: [CatalogueController],
      providers: [CatalogueService],
    })
    .overrideProvider(CatalogueService)
    .useValue(mockCatalogueService)
    .compile();

    controller = module.get<CatalogueController>(CatalogueController);
    service = module.get<CatalogueService>(CatalogueService);
    jest.clearAllMocks();
  });

  describe('Instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('getRules', () => {
    describe('for Unknown', () => {
      let rules: Rule[];
      beforeEach(() => {
        rules = controller.getRules({});
      });

      it('should return empty list', () => {
        expect(rules.length).toBe(4);
      });
    });
  });

  describe('getCountries', () => {
    let countries: Country[];
    beforeEach(async () => {
      service.fetchCountries().subscribe(countries => console.log(countries));
      countries = await firstValueFrom(controller.getCountries());
    });

    it('should be called', () => {
      expect(service.fetchCountries).toBeCalledTimes(1);
    });

    it('should not be empty', () => {
      expect(countries.length).toBe(countriesStub().length);
    });
  });
});
