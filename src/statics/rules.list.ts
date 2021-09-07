import { Rule } from "src/catalogue/entities/rule.entity";
import { Roles } from "./roles.enum";

export const rules: Rule[] = [
  {
    roles: [Roles.Student, Roles.Employee],
    keyName: 'student_rules',
    name: {
      en: 'Something',
      es: 'Algo',
    },
    pdfUrl: 'https://um.edu.mx/descargas/reglamento.pdf',
  },
  {
    roles: [Roles.Student, Roles.Employee],
    keyName: 'legislation_undergraduate',
    name: {
      en: 'Something',
      es: 'Algo',
    },
    pdfUrl: 'https://um.edu.mx/descargas/leg_pregrado.pdf',
  },
  {
    roles: [Roles.Student, Roles.Employee],
    keyName: 'legislation_posgraduate',
    name: {
      en: 'Something',
      es: 'Algo',
    },
    pdfUrl: 'https://um.edu.mx/descargas/leg_posgrado.pdf',
  },
  {
    roles: [Roles.Employee],
    keyName: 'policy_manual',
    name: {
      en: 'Something',
      es: 'Algo',
    },
    pdfUrl: 'https://virtual-um.um.edu.mx/financiero/rh/formularios/ManualDePoliticas.pdf',
  },
];