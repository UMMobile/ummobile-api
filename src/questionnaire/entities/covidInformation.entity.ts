export type CovidReasons = 'recentArrival' | 'isSuspect' | 'haveCovid' | 'isInQuarantine' | 'noResponsiveLetter' | 'none';

export class CovidValidation {
  allowAccess: Boolean;
  reason: CovidReasons;
  qrUrl: String;
  validations: CovidValidations;
  usedData: CovidInformation;
}

export class CovidValidations {
  recentArrival: Boolean;
  isSuspect: Boolean;
  haveCovid: Boolean;
  isInQuarantine: Boolean;
  noResponsiveLetter: Boolean
}

export class CovidInformation {
  arrivalDate?:Date;

  isVaccinated:Boolean;
  
  haveCovid:Boolean;
  startCovidDate?:Date;
  
  isSuspect:Boolean;
  startSuspicionDate?:Date;

  isInQuarantine:Boolean;
  quarantineEndDate?:Date;
}