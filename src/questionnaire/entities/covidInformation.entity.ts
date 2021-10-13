import { Reasons } from "src/statics/types";

export class CovidValidation {
  allowAccess: boolean;
  reason: Reasons;
  qrUrl: string;
  validations: CovidValidations;
  usedData: CovidInformation;
}

export class CovidValidations {
  recentArrival: boolean;
  isSuspect: boolean;
  haveCovid: boolean;
  isInQuarantine: boolean;
  noResponsiveLetter: boolean
}

export class CovidInformation {
  arrivalDate?:Date;

  isVaccinated:boolean;
  
  haveCovid:boolean;
  startCovidDate?:Date;
  
  isSuspect:boolean;
  startSuspicionDate?:Date;

  isInQuarantine:boolean;
  quarantineEndDate?:Date;
}