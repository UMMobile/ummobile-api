import { ContractTypes } from "src/statics/types";

export class Position {
  id: string;
  department: string;
  name?: string;
}

export class EmployeeExtras {
  imss: string;
  rfc: string;
  contract: ContractTypes;
  positions: Position[];
}