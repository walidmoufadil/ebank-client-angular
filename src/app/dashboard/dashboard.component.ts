import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { BaseAccount } from '../models/account.model';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { chartColors, commonOptions } from '../config/chart.config';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  
  accounts: BaseAccount[] = [];
  loading = true;
  totalBalance = 0;
  totalAccounts = 0;

  // Graphique en donut pour les types de comptes
  accountTypeChartData = {
    labels: ['Comptes Courants', 'Comptes Épargne'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [chartColors.primary, chartColors.success]
    }]
  };

  accountTypeChartOptions: any = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        ...commonOptions.plugins?.title,
        text: 'Distribution des types de comptes'
      }
    }
  };

  // Graphique en barres pour les soldes
  balanceChartData = {
    labels: [] as string[],
    datasets: [{
      label: 'Solde des comptes',
      data: [] as number[],
      backgroundColor: chartColors.primary
    }]
  };

  balanceChartOptions: any = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Solde (MAD)'
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      title: {
        ...commonOptions.plugins?.title,
        text: 'Soldes des comptes'
      },
      legend: {
        display: false
      }
    }
  };

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.updateDashboardStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private updateDashboardStats(): void {
    // Mise à jour des statistiques générales
    this.totalAccounts = this.accounts.length;
    this.totalBalance = this.accounts.reduce((sum, account) => sum + account.balance, 0);

    // Mise à jour du graphique des types de comptes
    const currentAccounts = this.accounts.filter(a => a.type === 'CurrentAccount').length;
    const savingAccounts = this.accounts.filter(a => a.type === 'SavingAccount').length;
    
    if (this.accountTypeChartData.datasets[0]) {
      this.accountTypeChartData.datasets[0].data = [currentAccounts, savingAccounts];
    }

    // Mise à jour du graphique des soldes
    this.balanceChartData.labels = this.accounts.map(a => a.id.slice(0, 8) + '...');
    if (this.balanceChartData.datasets[0]) {
      this.balanceChartData.datasets[0].data = this.accounts.map(a => a.balance);
    }

    // Force la mise à jour des graphiques
    if (this.chart) {
      this.chart.update();
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  }
}
