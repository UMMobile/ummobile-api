import { IsDateString, IsDefined, IsNumber, IsOptional } from "class-validator";

export class PaymentDto {
  readonly omitirNotif: string = '0'; // static
  readonly promotions: string = 'C'; // static
  readonly stEmail: string = '0'; // static

  @IsDefined()
  reference: string; // Format: studentId-balanceId-
  
  @IsDefined()
  @IsNumber()
  amount: number;

  @IsDefined()
  @IsDateString()
  expirationDate: Date; // A day after today (today + 1day)

  @IsDefined()
  clientMail: string;

  @IsOptional()
  additionalData?: PaymentAdditionalData[];
}

export class PaymentAdditionalData {
  id: string;
  label: string;
  value: string;
}