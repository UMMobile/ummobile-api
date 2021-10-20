import { ApiProperty } from "@nestjs/swagger";
import { Roles } from "src/statics/roles.enum";

export class Rule {
  @ApiProperty({
    enum: Roles,
    isArray: true,
  })
  roles: Roles[];
  keyName: string;
  pdfUrl: string;
}
