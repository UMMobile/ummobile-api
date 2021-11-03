import { IsDateString, ValidateIf } from "class-validator";

export class UpdateNotificationDto {
  @ValidateIf(i => !i.seen && !i.received)
  @IsDateString()
  deleted: Date;

  @ValidateIf(i => !i.deleted && !i.received)
  @IsDateString()
  seen: Date;

  @ValidateIf(i => !i.deleted && !i.seen)
  @IsDateString()
  received: Date;
}
