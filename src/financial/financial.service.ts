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
    return this.http.get<[]>(`${this.am.url}/umfin/1.0/saldoorgid/${userId}`, {headers: {'Authorization': `Bearer ${this.am.key}`}})
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
      this.http.get<[]>(`${this.am.url}/umfin/1.0/movs/${userId}/${currentYear}/${balanceId}`, {headers: {'Authorization': `Bearer ${this.am.key}`}}),
      options.includeLastYear ? this.http.get<[]>(`${this.am.url}/umfin/1.0/movs/${userId}/${currentYear - 1}/${balanceId}`, {headers: {'Authorization': `Bearer ${this.am.key}`}}) : of(undefined),
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
