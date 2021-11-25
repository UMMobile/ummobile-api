import { IsBoolean, IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class AuthDto {
  @IsDefined()
  @IsNumber()
  username: number;

  @IsDefined()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  sandbox: boolean;
}