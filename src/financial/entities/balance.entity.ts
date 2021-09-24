import { Movement } from "./movement.entity";

export class Balance {
  id: String;
  name: String;
  current: Number;
  due: Number;
  type: String;
  promissoryNoteNotDue?: Number;
  nextPromissoryNote?: String;
  nextPromissoryNoteAmount?: Number;
  movements: String | {
    current: Movement[],
    lastYear: Movement[],
  } | Movement[];
}
