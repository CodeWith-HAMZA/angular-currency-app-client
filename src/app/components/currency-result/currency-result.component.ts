import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'currency-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-result.component.html',
  styleUrl: './currency-result.component.css',
})
export class CurrencyResultComponent {
  @Input() data: {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    convertedAmount: number;
    toCurrencyRate: number;
  } | null = null;
}

