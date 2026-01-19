import { Component, OnInit, signal, inject, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


import { CurrencyConversionsListComponent } from './components/currency-conversions-list/currency-conversions-list.component';
import { CurrencyResultComponent } from './components/currency-result/currency-result.component';
import { CurrencyService } from './core/services/currency.service';
import { filterPastDates, formatDate, pushLocal } from './utils';


interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyDataResponse {
  data: Record<string, Currency>;
}

interface HistoricalRatesResponse {
  data: Record<string, Record<string, number>>;
}

interface ConversionResult {
  amount: number;
  convertedAmount: number;
  toCurrencyRate: number;
  fromCurrency: string;
  toCurrency: string;
  date: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    FormsModule,
    CurrencyResultComponent,
    CurrencyConversionsListComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [CurrencyService],
})
export class App implements OnInit {
  // State signals
  readonly converting = signal<boolean>(false);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly currencies = signal<CurrencyDataResponse | null>(null);
  readonly convertedResult = signal<ConversionResult | null>(null);

  // Form signals
  readonly selectedCurrency = signal<string | null>(null);
  readonly toCurrency = signal<string | null>(null);
  readonly amount = signal<number | null>(null);
  readonly selectedDate = signal<Date | null>(null);

  // Utility functions exposd to template
  readonly filterPastDates = filterPastDates;
  readonly objectValues = Object.values;
  readonly canConvert = computed(() =>
    !!this.selectedCurrency() &&
    !!this.toCurrency() &&
    !!this.amount() &&
    this.amount()! > 0 &&
    !this.converting() &&
    this.selectedDate() instanceof Date
  );
  
  constructor(private readonly currencyService: CurrencyService) {}
  private destroyRef = inject(DestroyRef);


  ngOnInit(): void {
    this.loadCurrencies();
  }

  // Fetches available currencies from the API
  
  private loadCurrencies(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.currencyService
      .getCurrencies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: CurrencyDataResponse) => {
          this.currencies.set(data);
          this.isLoading.set(false);
          this.error.set(null);
        },
        error: (error: unknown) => {
          this.handleError('Failed to load currencies. Please refresh the page.', error);
          this.isLoading.set(false);
        },
      });
  }

  // On Convert Listner 
  onConvertClick(): void {
    if (!this.validateForm()) {
      return;
    }

    const formattedDate = this.getFormattedDate();
    if (!formattedDate) {
      this.error.set('Please select a valid date.');
      return;
    }

    const fromCurrency = this.selectedCurrency()!;
    const toCurrency = this.toCurrency()!;
    const amount = this.amount()!;

    this.performConversion(formattedDate, fromCurrency, toCurrency, amount);
  }

  // Validates the form fields
  private validateForm(): boolean {
    const hasCurrency = !!this.selectedCurrency();
    const hasToCurrency = !!this.toCurrency();
    const hasAmount = !!this.amount() && this.amount()! > 0;
    const hasDate = this.selectedDate() instanceof Date;

    if (!hasCurrency || !hasToCurrency || !hasAmount || !hasDate) {
      this.error.set('Please fill in all required fields.');
      return false;
    }

    return true;
  }

  
  // Formats the selected date
  private getFormattedDate(): string | null {
    const date = this.selectedDate();
    if (!(date instanceof Date)) {
      return null;
    }
    return formatDate(date);
  }

  // Performs the currency conversion
  private performConversion(
    formattedDate: string,
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): void {
    this.converting.set(true);
    this.error.set(null);

    this.currencyService
      .getHistoricalRates(formattedDate, fromCurrency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: HistoricalRatesResponse) => {
          this.handleConversionSuccess(response, formattedDate, fromCurrency, toCurrency, amount);
        },
        error: (error: unknown) => {
          this.handleError('Failed to fetch historical rates. Please try again.', error);
          this.converting.set(false);
        },
      });
  }

  
  // Handles successful conversion response
  private handleConversionSuccess(
    response: HistoricalRatesResponse,
    formattedDate: string,
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): void {
    const ratesForDate = response.data[formattedDate];
    if (!ratesForDate) {
      this.handleError('No exchange rates found for the selected date.', null);
      this.converting.set(false);
      return;
    }

    const toCurrencyRate = ratesForDate[toCurrency];
    if (!toCurrencyRate || toCurrencyRate <= 0) {
      this.handleError(`Exchange rate not found for ${toCurrency}.`, null);
      this.converting.set(false);
      return;
    }

    const convertedAmount = amount * toCurrencyRate;
    const result: ConversionResult = {
      amount,
      convertedAmount,
      toCurrencyRate,
      fromCurrency,
      toCurrency,
      date: formattedDate,
    };

    this.convertedResult.set(result);
    pushLocal('conversion-history', result);
    this.converting.set(false);
  }

  
  private handleError(message: string, error: unknown): void {
    this.error.set(message);

     if (error) {
      // furth er can handle the errors here

    }
  }
}
