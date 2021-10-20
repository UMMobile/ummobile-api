import { IsBoolean, IsOptional } from "class-validator";

export class UpdateCovidInformationDto {
  @IsOptional()
  @IsBoolean()
  isSuspect: boolean;
}

export class UpdatedCovidInformationResDto{
  updated: boolean;
  message?: string;
}