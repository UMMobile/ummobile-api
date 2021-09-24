import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { UtilsService } from 'src/utils/utils.service';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto } from './dto/update-financial.dto';
import { Balance } from './entities/balance.entity';
import { Movement } from './entities/movement.entity';

@Injectable()
export class FinancialService {
  constructor(
    private readonly http: HttpService,
    private readonly utils: UtilsService,
  ) {}

  /**
   * Fetches the user balances.
   * @param userId The user id to fetch with
   * @return An observable with a list of balances
   */
  fetchBalances(
    userId: String,
    options: { movementsType: 0 | 1 | 2 } = { movementsType: 0 },
  ): Observable<Balance[]> {
    return this.http.get<[]>(`/umfin/1.0/saldoorgid/${userId}`)
    .pipe(
      map(({data}) => {
        const balances: Balance[] = [];
        const currentYear: Number = new Date().getFullYear();
        
        data.forEach(unformattedBalance => {
          const balance: Balance = {
            id: unformattedBalance['orgId'],
            name: unformattedBalance['nombreOrgid'],
            current: unformattedBalance['saldo'],
            due: unformattedBalance['saldoVencido'],
            type: unformattedBalance['tipoSaldo'],
            movements: '',
          };

          switch(options.movementsType) {
            case 1:
              break;
            case 2:
              break;
            case 0:
            default:
              balance.movements = `/financial/balances/${balance.id}/movements`;
          }

          balances.push(balance);
        });
        return balances;
      }),
      catchError(this.utils.handleHttpError<Balance[]>([])),
    );
  }

  /**
   * Fetches the user balance movements.
   * @param userId The user id to fetch with
   * @return An observable with a list of movements
   */
   fetchBalancesMovements(
    userId: String,
    balanceId: String,
    options: { includeLastYear: Boolean } = { includeLastYear: true },
  ): Observable<{current: Movement[], lastYear?: Movement[]}> {
    const currentYear: number = new Date().getFullYear();
    return forkJoin([
      this.http.get<[]>(`/umfin/1.0/movs/${userId}/${currentYear}/${balanceId}`),
      options.includeLastYear ? this.http.get<[]>(`/umfin/1.0/movs/${userId}/${currentYear - 1}/${balanceId}`) : of(undefined),
    ])
    .pipe(
      map(([{data: resCurrent}, resLastYear]) => {
        const current: Movement[] = [];
        resCurrent.forEach(unformattedMovement => current.push({
          id: unformattedMovement['id'],
          amount: unformattedMovement['amount'],
          balanceAfterThis: unformattedMovement['saldo'],
          description: unformattedMovement['descripcion'],
          date: unformattedMovement['transactionDate'] ? new Date(unformattedMovement['transactionDate']) : undefined,
          type: unformattedMovement['crDb'],
        }));

        const res: {current: Movement[], lastYear?: Movement[]} = {
          current
        };

        if(resLastYear) {
          const lastYear: Movement[] = [];
          resLastYear.data.forEach(unformattedMovement => lastYear.push({
            id: unformattedMovement['id'],
            amount: unformattedMovement['amount'],
            balanceAfterThis: unformattedMovement['saldo'],
            description: unformattedMovement['descripcion'],
            date: unformattedMovement['transactionDate'] ? new Date(unformattedMovement['transactionDate']) : undefined,
            type: unformattedMovement['crDb'],
          }));
          res.lastYear = lastYear;
        }

        return res;
      }),
      catchError(this.utils.handleHttpError<{current: Movement[], lastYear?: Movement[]}>({current: []})),
    );
  }

  create(createFinancialDto: CreateFinancialDto) {
    return 'This action adds a new financial';
  }

  findAll() {
    return `This action returns all financial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} financial`;
  }

  update(id: number, updateFinancialDto: UpdateFinancialDto) {
    return `This action updates a #${id} financial`;
  }

  remove(id: number) {
    return `This action removes a #${id} financial`;
  }
}
