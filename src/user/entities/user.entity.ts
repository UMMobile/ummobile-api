import { Roles } from "src/statics/types";
import { EmployeeExtras } from "./employee.entity";
import { Academic, Scholarship, StudentExtras } from "./student.entity";

export class User {
  id: string;
  name: string;
  surnames: string;
  image: string;
  extras: UserExtras;
  student?: StudentUser;
  employee?: EmployeeExtras;
  role: Roles;
}

export class UserExtras {
  email: string;
  phone: string;
  curp: string;
  maritalStatus: string;
  birthday: Date;
}

export class StudentUser extends StudentExtras {
  academic?: Academic;
  scholarship?: Scholarship;
}
