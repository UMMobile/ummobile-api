import { IsDefined, IsNumberString, IsOptional } from "class-validator";

export class PaymentDto {
  readonly omitirNotif: String = '0'; // static
  readonly promotions: String = 'C'; // static
  readonly stEmail: String = '0'; // static

  @IsDefined()
  reference: String; // Format: studentId-balanceId-
  
  @IsDefined()
  @IsNumberString()
  amount: String;

  @IsDefined()
  expirationDate: String; // A day after today (today + 1day)

  @IsDefined()
  clientMail: String;

  @IsOptional()
  additionalData?: PaymentAdditionalData[];
}

export class PaymentAdditionalData {
  id: String;
  label: String;
  value: String;
}