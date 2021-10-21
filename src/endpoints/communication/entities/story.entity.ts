import { ApiProperty } from "@nestjs/swagger";
import { MediaType } from "src/statics/mediaType.enum";

export class Story {
  startDate: Date;
  endDate: Date;
  duration: number;
  @ApiProperty({
    enum: MediaType,
  })
  type: MediaType;
  content: string;
}