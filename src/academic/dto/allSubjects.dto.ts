import { Semester } from "../entities/semester.entity";

export class AllSubjectsDto {
  planId:string;
  average: number;
  semesters: Semester[];
}