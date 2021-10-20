import { Movement } from "../entities/movement.entity";

export class MovementsDto {
  balanceId?: string;
  current: Movement[];
  lastYear?: Movement[];
}