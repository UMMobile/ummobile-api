export class Subject {
  name: String;
  score: Number;
  isExtra: Boolean;
  credits: Number;
  teacher: {
    name: String;
  };
  extras: {
    loadId:String;
    type: String;
    semester: number;
  }
}