import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import apiManagerConfig from 'src/config/apiManager.config';
import { UtilsService } from 'src/utils/utils.service';
import { MovementsDto } from './dto/movements.dto';
import { PaymentUrlDto } from './dto/paymentUrl.dto';
import { Balance } from './entities/balance.entity';
import { Movement } from './entities/movement.entity';
import { PaymentDto } from './dto/payment.dto';
import { Roles } from 'src/statics/roles.enum';
import { AxiosResponse } from 'axios';

@Injectable()
export class FinancialService {
  constructor(
    private readonly http: HttpService,
    private readonly utils: UtilsService,
    @Inject(apiManagerConfig.KEY) private readonly am: ConfigType<typeof apiManagerConfig>,
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
    const isEmployee: boolean = this.utils.getRoleFromId(userId) === Roles.Employee;

    return this.http.get<[]>(`${this.am.url}/umfin/1.0/saldoorgid/${userId}`, {headers: {'Authorization': `Bearer ${this.am.key}`}})
    .pipe(
      switchMap(({data}) => {
        const balances: Balance[] = [];

        if(isEmployee) {
          balances.push({
            id: '133EMPLE01',
            name: 'EMPLEADOS',
            current: 0,
            currentDebt: 0,
            type: 'D',
            movements: '/financial/balances/133EMPLE01/movements',
          });
        }else {
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
        }

        // Prepare observables with current balances amounts
        let obsCurrentAmounts: Observable<{id: string, currentAmount: number}>[] = 
          balances.map(balance =>
            this.getCurrentBalance(userId, balance.id).pipe(
              map((currentAmount) => ({
                id: balance.id,
                currentAmount, 
              }))
            )
          );

        return forkJoin([
          of(balances),
          ...obsCurrentAmounts,
        ]);
      }),
      switchMap(([balances, ...currentAmounts]) => {
        // Set the current amount and type to balances
        balances.map(balance => {
          balance.current = currentAmounts.filter(item => item.id === balance.id)[0]?.currentAmount ?? 0;
          balance.type = balance.current <= 0 ? 'C' : 'D';
          return balance;
        });

        // Prepare the movements observables if needed
        let obsMovements: Observable<MovementsDto>[] = [];
        if(options.includeMovements === 1 || options.includeMovements === 2) {
          obsMovements = balances.map(balance => this.fetchBalancesMovements(userId, balance.id));
        }

        return forkJoin([
          of(balances),
          ...obsMovements,
        ]);
      }),
      map(([balances, ...movementsBalances]): Balance[] => {
        // Set the movements list if needed
        if(options.includeMovements === 1 || options.includeMovements === 2) {
          balances.map(balance => {
            const movements: MovementsDto = movementsBalances.find(movements => movements.balanceId === balance.id);
            balance.movements = {
              current: movements?.current ?? [],
              lastYear: options.includeMovements === 2 ? movements?.lastYear ?? [] : undefined,
            };
            return balance;
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
   * @param balanceId The balance id to search.
   * @param options The options to format the response.
   * @param options.includeLastYear `false` for only current movements & `true` for current and last year movements. Default `false`.
   * @return An observable with a `MovementsDto`
   */
  fetchBalancesMovements(
    userId: string,
    balanceId: string,
    options: {
      includeLastYear: Boolean,
      startDate?: Date,
      endDate?: Date,
    } = { includeLastYear: true },
  ): Observable<MovementsDto> {
    const isStudent: boolean = this.utils.getRoleFromId(userId) === Roles.Student;
    // Returns the Get to fetch the movements for the user.
    // The path is different for students and employees but the logic it's the same. 
    const prepareGetMovementsForRole = (userId: string, year: number): Observable<AxiosResponse<[]>> => {
      if(isStudent) {
        return this.http.get<[]>(`${this.am.url}/umfin/1.0/movs/${userId}/${year}/${balanceId}`, {headers: {'Authorization': `Bearer ${this.am.key}`}});
      } else {
        // Default 01-01-{year}
        const startDate: string = this.utils.formatDDMMYYYY(options.startDate ? options.startDate : new Date(year, 0, 1));
        // Default 31-12-{year}
        const endDate: string = this.utils.formatDDMMYYYY(options.endDate ? options.endDate : new Date(year, 11, 31));
        return this.http.get<[]>(`${this.am.url}/umfin/1.0/movimientos/${balanceId}/${userId}/${startDate}/${endDate}`, {headers: {'Authorization': `Bearer ${this.am.key}`}});
      }
    }
    
    // Prepare Get for current or selected movements
    const year: number = options.startDate ? options.startDate.getFullYear() : new Date().getFullYear();
    let getCurrentMovements: Observable<AxiosResponse<[]>> = prepareGetMovementsForRole(userId, year);

    // Prepare Get for previous year movements only if it is specified by `options.includeLastYear`.
    let getLastYearMovements: Observable<AxiosResponse<[]>>;
    if(options.includeLastYear) {
      getLastYearMovements = prepareGetMovementsForRole(userId, year - 1);
    }

    return forkJoin([
      getCurrentMovements,
      getLastYearMovements ? getLastYearMovements : of(undefined),
    ])
    .pipe(
      map(([{data: resCurrent}, resLastYear]) => {
        // Map a movement from a JSON for both student or employee.
        const mapMovement = (unformattedMovement: any, id?: number): Movement => {
          return {
            id: isStudent ? unformattedMovement['id'] : id,
            amount: isStudent ? unformattedMovement['amount'] : unformattedMovement['creditos'] ? unformattedMovement['creditos'] : unformattedMovement['debitos'] > 0 ? -unformattedMovement['debitos'] : unformattedMovement['debitos'],
            balanceAfterThis: unformattedMovement['saldo'],
            description: unformattedMovement[isStudent ? `descripcion` : 'descriptn'],
            date: (unformattedMovement['transactionDate'] || unformattedMovement['transDatetime']) ? new Date(unformattedMovement[isStudent ? 'transactionDate' : 'transDatetime']) : undefined,
            type: isStudent ? unformattedMovement['crDb'] : unformattedMovement['creditos'] ? 'C' : 'D',
          }
        };

        const current: Movement[] = [];
        resCurrent.forEach((unformattedMovement, i) => {
          current.push(isStudent ? mapMovement(unformattedMovement) : mapMovement(unformattedMovement, i));
        });

        const res: MovementsDto = {
          balanceId,
          current
        };

        if(resLastYear) {
          const lastYear: Movement[] = [];
          resLastYear.data.forEach((unformattedMovement, i) => {
            lastYear.push(isStudent ? mapMovement(unformattedMovement) : mapMovement(unformattedMovement, i));
          });
          res.lastYear = lastYear;
        }

        return res;
      }),
      catchError(this.utils.handleHttpError<MovementsDto>({balanceId: '', current: []})),
    );
  }

  /**
   * Get the current balance for the specified balance account.
   * @param userId The user id to fetch with.
   * @param balanceId The balance id to search.
   * @return An observable with the current balance.
   */
  getCurrentBalance(userId: string, balanceId: string): Observable<number> {
    const lastMonth: Date = new Date();
    lastMonth.setDate(lastMonth.getDate() - 31);

    const tomorrow: Date = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.fetchBalancesMovements(userId, balanceId, {
      includeLastYear: false,
      startDate: lastMonth,
      endDate: tomorrow,
    }).pipe(
      map((movements: MovementsDto) => movements.current[movements.current.length - 1]?.balanceAfterThis ?? 0),
      catchError(this.utils.handleHttpError<number>(0))
    )
  }

  /**
   * Generate a payment URL.
   * @param payment The payment information
   * @param options The options of the request.
   * @param options.requestInvoice `true` to request invoice. Default `false`.
   * @return An observable with the payment URL.
   */
  generatePaymentUrl(
    payment: PaymentDto,
    options: {requestInvoice:boolean} = {requestInvoice: false},
  ): Observable<PaymentUrlDto> {
    return this.http.post<string>(this.am.payment, {
      'reference': payment.reference,
      'amount': payment.amount,
      'omitirNotif': payment.omitirNotif,
      'promociones': payment.promotions,
      'stCorreo': payment.stEmail,
      'fhVigencia': this.utils.formatDDMMYYYY(new Date(payment.expirationDate)),
      'mailCliente': payment.clientMail,
      'datosAdicionalesList': payment.additionalData,
    }).pipe(
      map(({data}) => {
        if(data && options.requestInvoice)
          this.http.post<void>(this.am.invoice, payment).subscribe();

        return { url: data };
      }),
      catchError(this.utils.handleHttpError<PaymentUrlDto>(new PaymentUrlDto())),
    );
  }
}
