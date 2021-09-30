import { Residence } from "src/statics/types";

export class StudentExtras {
  baptized: boolean;
  religion: string;
  studentType: string;
}

export class Academic {
  modality: string;
  signedUp: boolean;
  residence: string;
  dormitory: number;
}

export class Scholarship {
  workplace: string;
  position: string;
  startDate: Date;
  endDate: Date;
  hours: number;
  status: string;
}
