import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly baseUrl = import.meta.env?.['NG_APP_API_URL'] ?? '';

  constructor(private http: HttpClient) {}

  getCurrencies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/currencies`);
  }

  getHistoricalRates(date: string, base: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/historical`, {
      params: { date, base_currency: base }
    });
  }
}
