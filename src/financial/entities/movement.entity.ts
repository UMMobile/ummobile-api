enum MovementType {
  C = 'C',
  D = 'D'
};

export class Movement {
  id: number;
  amount: number;
  balanceAfterThis: number;
  type: MovementType;
  description: string;
  date: Date;
}
