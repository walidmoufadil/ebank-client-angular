import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { BaseAccount } from '../models/account.model';
import { Operation } from '../models/operation.model';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { chartColors, commonOptions } from '../config/chart.config';
import { forkJoin } from 'rxjs';

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
  operations: Map<string, Operation[]> = new Map();
  loading = true;
  dataAnalysisLoading = false;
  totalBalance = 0;
  totalAccounts = 0;
  totalCredit = 0;
  totalDebit = 0;
  netFlow = 0;

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

  // Graphique d'analyse des opérations pour l'aide à la décision
  operationsAnalysisChartData = {
    labels: [] as string[],
    datasets: [
      {
        label: 'Crédits',
        data: [] as number[],
        backgroundColor: chartColors.success,
        borderColor: chartColors.success,
        borderWidth: 1
      },
      {
        label: 'Débits',
        data: [] as number[],
        backgroundColor: chartColors.danger,
        borderColor: chartColors.danger,
        borderWidth: 1
      }
    ]
  };

  operationsAnalysisChartOptions: any = {
    ...commonOptions,
    scales: {
      x: {
        stacked: false,
        title: {
          display: true,
          text: 'Date des opérations'
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Montant (MAD)'
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      title: {
        ...commonOptions.plugins?.title,
        text: 'Analyse des tendances (Crédits vs Débits)'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MAD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
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
        
        // Une fois les données de compte chargées, chargeons les opérations pour l'analyse
        this.loadOperationsData();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }
  
  private loadOperationsData(): void {
    if (this.accounts.length === 0) return;
    
    this.dataAnalysisLoading = true;
    
    // Récupérer les IDs des comptes
    const accountIds = this.accounts.map(account => account.id);
    
    // Charger toutes les opérations pour tous les comptes
    this.transactionService.getAllAccountsOperations(accountIds).subscribe({
      next: (operationsMap) => {
        this.operations = operationsMap;
        this.updateOperationsAnalysis();
        this.dataAnalysisLoading = false;
      },
      error: (error) => {
        console.error('Error loading operations data:', error);
        this.dataAnalysisLoading = false;
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
  
  private updateOperationsAnalysis(): void {
    if (this.operations.size === 0) return;
    
    // Réinitialiser les totaux
    this.totalCredit = 0;
    this.totalDebit = 0;
    
    // Collecter toutes les opérations
    let allOperations: Operation[] = [];
    this.operations.forEach(ops => {
      allOperations = allOperations.concat(ops);
      
      // Calculer les totaux
      ops.forEach(op => {
        if (op.type === 'CREDIT') {
          this.totalCredit += op.amount;
        } else if (op.type === 'DEBIT') {
          this.totalDebit += op.amount;
        }
      });
    });
    
    this.netFlow = this.totalCredit - this.totalDebit;
    
    // Trier les opérations par date
    allOperations.sort((a, b) => new Date(a.operationDate).getTime() - new Date(b.operationDate).getTime());
    
    // Préparer les données pour le graphique d'analyse des tendances
    this.prepareOperationsTrendAnalysis(allOperations);
    
    // Force la mise à jour des graphiques
    if (this.chart) {
      this.chart.update();
    }
  }
  
  private prepareOperationsTrendAnalysis(operations: Operation[]): void {
    // Regrouper les opérations par date (jour)
    const operationsByDate = new Map<string, { date: Date, credits: number, debits: number }>();
    
    operations.forEach(op => {
      const date = new Date(op.operationDate);
      const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      
      if (!operationsByDate.has(dateKey)) {
        operationsByDate.set(dateKey, { date, credits: 0, debits: 0 });
      }
      
      const dayData = operationsByDate.get(dateKey)!;
      
      if (op.type === 'CREDIT') {
        dayData.credits += op.amount;
      } else if (op.type === 'DEBIT') {
        dayData.debits += op.amount;
      }
    });
    
    // Convertir en tableaux pour le graphique
    const sortedDates = Array.from(operationsByDate.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    this.operationsAnalysisChartData.labels = sortedDates.map(data => 
      data.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    );
    
    this.operationsAnalysisChartData.datasets[0].data = sortedDates.map(data => data.credits);
    this.operationsAnalysisChartData.datasets[1].data = sortedDates.map(data => data.debits);
  }
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      signDisplay: 'auto'
    }).format(amount);
  }

  getCreditDebitRatio(): number {
    if (this.totalDebit === 0) return this.totalCredit > 0 ? Infinity : 0;
    return this.totalCredit / this.totalDebit;
  }
}
