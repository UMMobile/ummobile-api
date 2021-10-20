import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsDefined, IsNotEmptyObject, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";

export class RecentContact {
  @IsDefined()
  @IsBoolean()
  yes: boolean;

  @ValidateIf(i => i.yes)
  @IsDateString()
  when?: Date;
}

export class RecentCountry {
  @ValidateIf(i => !i.city && !i.date)
  @IsString()
  country: string;

  @ValidateIf(i => !i.country && !i.date)
  @IsString()
  city: string;

  @ValidateIf(i => !i.country && !i.city)
  @IsDateString()
  date?: Date;
}

export class CovidQuestionnaireAnswerDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => RecentCountry)
  countries: RecentCountry[];

  @IsDefined()
  @ValidateNested()
  @Type(() => RecentContact)
  recentContact: RecentContact;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'boolean'
    }
  })
  @IsDefined()
  @IsNotEmptyObject()
  majorSymptoms: {[key: string]: boolean};

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'boolean'
    }
  })
  @IsDefined()
  @IsNotEmptyObject()
  minorSymptoms: {[key: string]: boolean};
}
