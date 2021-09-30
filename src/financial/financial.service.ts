import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { UtilsService } from 'src/utils/utils.service';
import { MovementsDto } from './dto/movements.dto';
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
   * @param userId The user id to fetch with.
   * @param options The options to format the response.
   * @param options.includeMovements The format type for movements field. `0`: a link to movements, `1`: only current movements, `2`: current and last year movements. Any other value for this field will be treated as default. Default `0`.
   * @return An observable with a `Balance` list
   */
  fetchBalances(
    userId: string,
    options: { includeMovements: 0 | 1 | 2 } = { includeMovements: 0 },
  ): Observable<Balance[]> {
    return this.http.get<[]>(`/umfin/1.0/saldoorgid/${userId}`)
    .pipe(
      map(({data}) => {
        const balances: Balance[] = [];
        data.forEach(unformattedBalance => {
          const balance: Balance = {
            id: unformattedBalance['orgId'],
            name: unformattedBalance['nombreOrgid'],
            current: unformattedBalance['saldo'],
            currentDebt: unformattedBalance['saldoVencido'],
            type: unformattedBalance['tipoSaldo'],
            movements: '',
          };
          balance.movements = `/financial/balances/${balance.id}/movements`;
          balances.push(balance);
        });
        return balances;
      }),
      switchMap((balances: Balance[]) => {
        if(options.includeMovements === 1 || options.includeMovements === 2) {
          const obsMovements: Observable<MovementsDto>[] = balances.map(balance => this.fetchBalancesMovements(userId, balance.id));
          return forkJoin([of(balances), ...obsMovements]);
        } else return forkJoin([of(balances)]);
      }),
      map(([balances, ...movementsBalances]): Balance[] => {
        if(movementsBalances) {
          movementsBalances.map(movements => balances.find(balance => balance.id === movements.balanceId).movements = {
              current: movements.current,
              lastYear: options.includeMovements === 2 ? movements.lastYear : undefined,
          });
        }
        return balances;
      }),
      catchError(this.utils.handleHttpError<Balance[]>([])),
    );
  }

  /**
   * Fetches the user balance movements.
   * @param userId The user id to fetch with.
   * @param options The options to format the response.
   * @param options.includeLastYear `false` for only current movements & `true` for current and last year movements. Default `false`.
   * @return An observable with a `MovementsDto`
   */
   fetchBalancesMovements(
    userId: string,
    balanceId: string,
    options: { includeLastYear: Boolean } = { includeLastYear: true },
  ): Observable<MovementsDto> {
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

        const res: MovementsDto = {
          balanceId,
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
      catchError(this.utils.handleHttpError<MovementsDto>({balanceId: '', current: []})),
    );
  }
}
