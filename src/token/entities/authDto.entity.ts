import { IsDefined, IsNumber, IsString } from "class-validator";

export class AuthDto {
  @IsDefined()
  @IsNumber()
  username: Number;

  @IsDefined()
  @IsString()
  password: String;
}