import { Subject } from "./subject.entity";

export class Semester {
  name:string;
  order:number;
  planId:string;
  subjects:Subject[];
}