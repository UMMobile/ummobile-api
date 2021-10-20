import { Rule } from "src/endpoints/catalogue/entities/rule.entity";
import { Roles } from "./roles.enum";

export const rules: Rule[] = [
  {
    roles: [Roles.Student, Roles.Employee],
    keyName: 'student_rules',
    pdfUrl: 'https://um.edu.mx/descargas/reglamento.pdf',
  },
  {
    roles: [Roles.Student, Roles.Employee],
    keyName: 'legislation_undergraduate',
    pdfUrl: 'https://um.edu.mx/descargas/leg_pregrado.pdf',
  },
  {
    roles: [Roles.Student, Roles.Employee],
    keyName: 'legislation_posgraduate',
    pdfUrl: 'https://um.edu.mx/descargas/leg_posgrado.pdf',
  },
  {
    roles: [Roles.Employee],
    keyName: 'policy_manual',
    pdfUrl: 'https://virtual-um.um.edu.mx/financiero/rh/formularios/ManualDePoliticas.pdf',
  },
];