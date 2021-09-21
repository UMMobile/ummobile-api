import { ContractTypes } from "src/statics/types";

export class Position {
  id: String;
  department: String;
  name?: String;
}

export class EmployeeExtras {
  imss: String;
  rfc: String;
  contract: ContractTypes;
  positions: Position[];
}