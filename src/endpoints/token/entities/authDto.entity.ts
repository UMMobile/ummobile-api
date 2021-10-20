import { IsDefined, IsNumber, IsString } from "class-validator";

export class AuthDto {
  @IsDefined()
  @IsNumber()
  username: number;

  @IsDefined()
  @IsString()
  password: string;
}