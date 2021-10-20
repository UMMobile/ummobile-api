import { Country } from "../../entities/country.entity";

export const countriesStub = (): Country[] => {
  return [{
      "id": 1,
      "name": "Afganistán"
    },
    {
      "id": 3,
      "name": "Albania"
    },
  ];
}