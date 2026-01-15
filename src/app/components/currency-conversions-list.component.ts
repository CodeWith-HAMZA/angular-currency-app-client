import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getLocal } from '../utils';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'currency-conversions-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <section class="currency-history">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <h2 style="margin:0;">Conversion History</h2>
        <button mat-raised-button color="primary" (click)="refresh()">Refresh</button>
      </div>
      <ul>
        <li *ngFor="let c of conversions; let i = index">
          <div class="currency-history__row">
            <span class="currency-history__main">#{{conversions.length - i}}: {{ c.amount | number }} {{ c.fromCurrency }} ➔ {{ c.convertedAmount | number }} {{ c.toCurrency }}</span>
            <span class="currency-history__rate">(Rate: {{ c.toCurrencyRate }}, Date: {{ c.date }})</span>
          </div>
        </li>
      </ul>
    </section>
  `,
  styleUrl: './currency-conversions-list.component.css',
})
export class CurrencyConversionsListComponent implements OnInit {
  conversions: Array<{
    amount: number;
    convertedAmount: number;
    toCurrencyRate: number;
    fromCurrency: string;
    toCurrency: string;
    date: string;
  }> = [];

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.conversions = getLocal('conversion-history', []);
    console.log(this.conversions)
  }
}
