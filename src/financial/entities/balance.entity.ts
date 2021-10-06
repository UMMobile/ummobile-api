import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { MovementsDto } from "../dto/movements.dto";

export class Balance {
  id: string;
  name: string;
  current: number;
  currentDebt: number;
  type: string;
  promissoryNoteNotDue?: number;
  nextPromissoryNote?: string;
  nextPromissoryNoteAmount?: number;
  @ApiProperty({
    oneOf: [{type: 'string'}, {
      $ref: getSchemaPath(MovementsDto)
    }]
  })
  movements: string | MovementsDto;
}