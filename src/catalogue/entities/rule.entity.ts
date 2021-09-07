import { Roles } from "src/statics/roles.enum";

export class Rule {
  roles: Roles[];
  keyName: String;
  name: {
    es: String;
    en: String;
  };
  pdfUrl: String;
}
