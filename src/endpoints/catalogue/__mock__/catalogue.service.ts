import { of } from "rxjs";
import { Roles } from "src/statics/roles.enum";
import { rules } from "src/statics/rules.list";
import { Rule } from "../entities/rule.entity";
import { countriesStub } from "../tests/stubs/countries.stub";

export const CatalogueService = jest.fn().mockImplementation(() => {
  return {
    filterRulesFor: jest.fn().mockImplementation((role: Roles): Rule[] => rules.filter(r => r.roles.includes(role))),
    fetchCountries: jest.fn().mockReturnValue(of(countriesStub())),
  }
});