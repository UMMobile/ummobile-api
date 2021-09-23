import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsDefined, IsNotEmptyObject, IsObject, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";

class RecentContact {
  @IsDefined()
  @IsBoolean()
  yes: Boolean;
  
  @ValidateIf(i => i.yes)
  @IsDate()
  when?: Date;
}

class RecentCountry {
  @ValidateIf(i => !i.city && !i.date)
  @IsString()
  country: String;

  @ValidateIf(i => !i.country && !i.date)
  @IsString()
  city: String;
  
  @ValidateIf(i => !i.country && !i.city)
  @IsDate()
  date?: Date;
}

export class CovidQuestionnaireAnswerDto {
  @IsDefined()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => RecentCountry)
  countries: RecentCountry[];

  @IsDefined()
  @ValidateNested()
  @Type(() => RecentContact)
  recentContact: RecentContact;

  @IsDefined()
  @IsNotEmptyObject()
  majorSymptoms: {[key: string]: boolean};
  
  @IsDefined()
  @IsNotEmptyObject()
  minorSymptoms: {[key: string]: boolean};
}
