import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CurrencyService } from './core/services/currency.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CurrencyResultComponent } from './components/currency-result/currency-result.component';
import { CurrencyConversionsListComponent } from './components/currency-conversions-list/currency-conversions-list.component';
import { formatDate, pushLocal, filterPastDates } from './utils';

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
  converting = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  filterPastDates = filterPastDates;
  protected readonly title = signal('project');
  currencies = signal<{ data: Record<string, any> } | null>(null);
  objectKeys = Object.keys;
  objectValues = Object.values;

  selectedCurrency = signal<string | null>(null);
  toCurrency = signal<string | null>(null);
  amount = signal<number | null>(null);
  selectedDate = signal<Date | null>(null);
  convertedResult = signal<{
    amount: number;
    convertedAmount: number;
    toCurrencyRate: number;
    fromCurrency: string;
    toCurrency: string;
    date: string;
  } | null>(null);

  constructor(private currencyService: CurrencyService) {
    this.currencyService.getCurrencies().subscribe({
      next: (data) => {
        this.currencies.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load currencies.');
        this.isLoading.set(false);
      },
    });
  }

  onConvertClick() {
    const date = this.selectedDate();
    console.log(date);
    let formattedDate = '';
    if (date instanceof Date)  formattedDate = formatDate(date);
    else console.log('No valid date selected');

    // Call the currency service API for historical rates
    if (this.selectedCurrency() && formattedDate) {
      this.converting.set(true);
      this.currencyService.getHistoricalRates(formattedDate, this.selectedCurrency()!).subscribe({
        next: (response) => {
          if (this.toCurrency) {
            // Get the rate for the to currency
            const toCurrencies: { [key: string]: number } = response.data[formattedDate];
            const toCurrencyRate = toCurrencies[this.toCurrency()!];
            const convertedAmount = this.amount()! * toCurrencyRate;
            console.log('Converted Amount:', convertedAmount);
            const resultItem = {
              amount: this.amount() ?? 0,
              convertedAmount: convertedAmount,
              toCurrencyRate: toCurrencyRate,
              date: formattedDate,
              fromCurrency: this.selectedCurrency()!,
              toCurrency: this.toCurrency()!,
            };
            this.convertedResult.set(resultItem);
            pushLocal('conversion-history', resultItem);
            this.converting.set(false);
          }
        },
        error: () => {
          this.converting.set(false);
          console.log('Failed to fetch historical rates');
        },
      });
    }

     
  }
}
