import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getLocal } from '../../utils';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'currency-conversions-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './currency-conversions-list.component.html',
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
