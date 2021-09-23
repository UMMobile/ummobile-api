import { IsBoolean, IsOptional } from "class-validator";

export class UpdateCovidInformationDto {
  @IsOptional()
  @IsBoolean()
  isSuspect: Boolean;
}