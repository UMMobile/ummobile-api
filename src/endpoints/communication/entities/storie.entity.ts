import { MediaType } from "src/statics/mediaType.enum";

export class Story {
  startDate: Date;
  endDate: Date;
  duration: number;
  type: MediaType;
  content: string;
}