import { Residence } from "src/statics/types";

export class StudentExtras {
  baptized: boolean;
  religion: string;
  type: string;
}

export class Academic {
  modality: string;
  signedUp: boolean;
  residence: Residence;
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
