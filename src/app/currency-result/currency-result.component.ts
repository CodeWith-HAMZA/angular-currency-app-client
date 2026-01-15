import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'currency-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="currency-result">
      <div class="currency-result__box">
        <h2>Conversion Result</h2>
        <div class="currency-result__values">
          <span class="currency-result__amount">{{ data?.amount | number }}</span>
          <span class="currency-result__from">{{ data?.fromCurrency }}</span>
          <span class="currency-result__equal">=</span>
          <span class="currency-result__converted">{{ data?.convertedAmount | number }}</span>
          <span class="currency-result__to">{{ data?.toCurrency }}</span>
        </div>
        <div class="currency-result__rate">
          <small>Rate: {{ data?.toCurrencyRate }}</small>
        </div>
      </div>
    </section>
  `,
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

