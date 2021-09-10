import { Subject } from "./subject.entity";

export class Semester {
  name:string;
  order:number;
  average:number;
  planId:string;
  subjects:Subject[];
}