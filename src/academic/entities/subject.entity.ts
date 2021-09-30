export class Subject {
  name: string;
  score: number;
  isExtra: boolean;
  credits: number;
  teacher: {
    name: string;
  };
  extras: {
    loadId:string;
    type: string;
    semester: number;
  }
}