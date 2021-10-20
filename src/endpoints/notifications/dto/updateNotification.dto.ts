import { IsDateString, ValidateIf } from "class-validator";

export class UpdateNotificationDto {
  @ValidateIf(i => !i.seen)
  @IsDateString()
  deleted: Date;

  @ValidateIf(i => !i.deleted)
  @IsDateString()
  seen: Date;
}
