export type MovementType = 'C' | 'D';

export class Movement {
  id: Number;
  amount: Number;
  balanceAfterThis: Number;
  type: MovementType;
  description: String;
  date?: Date;
}
