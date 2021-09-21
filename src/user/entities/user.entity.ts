import { Roles } from "src/statics/types";
import { EmployeeExtras } from "./employee.entity";
import { Academic, Scholarship, StudentExtras } from "./student.entity";

export class User {
  id: String;
  name: String;
  surnames: String;
  image: String;
  extras: UserExtras;
  student?: StudentUser;
  employee?: EmployeeExtras;
  role: Roles;
} 

export class UserExtras {
  email: String;
  phone: String;
  curp: String;
  maritalStatus: String;
  birthday: Date;
}

export class StudentUser extends StudentExtras {
  academic?: Academic;
  scholarship?: Scholarship;
}
