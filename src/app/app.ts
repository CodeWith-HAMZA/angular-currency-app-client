import { Component, signal } from '@angular/core';
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

import { CurrencyConversionsListComponent } from './components/currency-conversions-list/currency-conversions-list.component';
import { CurrencyResultComponent } from './components/currency-result/currency-result.component';
import { CurrencyService } from './core/services/currency.service';
import { filterPastDates, formatDate, pushLocal } from './utils';

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
export class App {
  // State signals
  converting = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  currencies = signal<{ data: Record<string, any> } | null>(null);
  convertedResult = signal<{
    amount: number;
    convertedAmount: number;
    toCurrencyRate: number;
    fromCurrency: string;
    toCurrency: string;
    date: string;
  } | null>(null);

  // Form signals
  selectedCurrency = signal<string | null>(null);
  toCurrency = signal<string | null>(null);
  amount = signal<number | null>(null);
  selectedDate = signal<Date | null>(null);

  // Utility properties
  filterPastDates = filterPastDates;
  objectKeys = Object.keys;
  objectValues = Object.values;
  protected readonly title = signal('');

  constructor(private currencyService: CurrencyService) {
    this.loadCurrencies();
  }

  private loadCurrencies(): void {
    this.currencyService.getCurrencies().subscribe({
      next: (data) => {
        this.currencies.set(data);
        this.isLoading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Failed to load currencies. Please refresh the page.');
        this.isLoading.set(false);
      },
    });
  }

  onConvertClick(): void {
    const date = this.selectedDate();
    if (!(date instanceof Date)) {
      return;
    }

    const formattedDate = formatDate(date);
    if (!formattedDate) {
      return;
    }

    const selectedCurrency = this.selectedCurrency();
    const toCurrency = this.toCurrency();
    const amount = this.amount();

    if (!selectedCurrency || !toCurrency || !amount) {
      return;
    }

    this.converting.set(true);

    this.currencyService.getHistoricalRates(formattedDate, selectedCurrency).subscribe({
      next: (response) => {
        const toCurrencies: { [key: string]: number } = response.data[formattedDate];
        const toCurrencyRate = toCurrencies[toCurrency];

        if (!toCurrencyRate) {
          this.error.set('Currency rate not found for selected date.');
          this.converting.set(false);
          return;
        }

        const convertedAmount = amount * toCurrencyRate;
        const resultItem = {
          amount: amount,
          convertedAmount: convertedAmount,
          toCurrencyRate: toCurrencyRate,
          date: formattedDate,
          fromCurrency: selectedCurrency,
          toCurrency: toCurrency,
        };

        this.convertedResult.set(resultItem);
        pushLocal('conversion-history', resultItem);
        this.converting.set(false);
      },
      error: () => {
        this.error.set('Failed to fetch historical rates. Please try again.');
        this.converting.set(false);
      },
    });
  }
}
