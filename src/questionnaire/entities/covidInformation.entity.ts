export type CovidReasons = 'recentArrival' | 'isSuspect' | 'haveCovid' | 'isInQuarantine' | 'none';

export class CovidValidation {
  pass: Boolean;
  reason: CovidReasons;
  validations: CovidValidations;
  usedData: CovidInformation;
}

export class CovidValidations {
  recentArrival: Boolean;
  isSuspect: Boolean;
  haveCovid: Boolean;
  isInQuarantine: Boolean;
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