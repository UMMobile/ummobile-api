import { Residence } from "src/statics/residence.enum";

export class StudentExtras {
  baptized: Boolean;
  religion: String;
  studentType: String;
}

export class Academic {
  modality: String;
  signedUp: Boolean;
  residence: Residence;
  dormitory: Number;
}

export class Scholarship {
  workplace: String;
  position: String;
  startDate:Date;
  endDate:Date;
  hours: Number;
  status: String;
}
