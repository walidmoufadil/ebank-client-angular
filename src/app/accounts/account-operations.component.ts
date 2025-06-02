import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Operation } from '../models/operation.model';
import { TransactionService } from '../services/transaction.service';
import { AccountService } from '../services/account.service';
import { BaseAccount } from '../models/account.model';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-account-operations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-semibold text-gray-900">Historique des Opérations</h1>
              <p class="mt-2 text-sm text-gray-700" *ngIf="account">
                Compte: {{ account.id }} | Client: {{ account.customerDTO?.name }}
              </p>
            </div>
            <button routerLink="/accounts" 
                    class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <mat-icon class="h-5 w-5 mr-2 -ml-1">arrow_back</mat-icon>
              Retour
            </button>
          </div>
          
          <div *ngIf="account" class="mt-4 p-4 bg-white shadow-md rounded-lg">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p class="text-sm text-gray-500 font-medium">Type de compte</p>
                <p class="mt-1 text-lg font-semibold">
                  {{ account.type === 'CurrentAccount' ? 'Compte Courant' : 'Compte Épargne' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium">Solde actuel</p>
                <p class="mt-1 text-lg font-semibold">{{ formatCurrency(account.balance) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium">État</p>
                <p class="mt-1">
                  <span [class]="'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + getStatusColor(account.status)">
                    {{ account.status }}
                  </span>
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium">Date de création</p>
                <p class="mt-1 text-sm">{{ formatDate(account.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center items-center py-12">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="rounded-md bg-red-50 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div *ngIf="!loading && !error && operations.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let operation of operations">                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ operation.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(operation.operationDate) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + getOperationTypeClass(operation.type)">
                    {{ operation.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" [class]="operation.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(operation.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ operation.description || 'Non spécifié' }}</td>                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span *ngIf="operation.userId" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ formatUsername(operation.userId) }}
                  </span>
                  <span *ngIf="!operation.userId" class="text-gray-400">Non spécifié</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && operations.length === 0" class="text-center py-12 bg-white shadow-md rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune opération</h3>
          <p class="mt-1 text-sm text-gray-500">Ce compte n'a pas encore d'opérations.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mat-column-amount {
      text-align: right;
    }
  `]
})
export class AccountOperationsComponent implements OnInit {
  accountId: string = '';
  account: BaseAccount | null = null;
  operations: Operation[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.accountId = id;
        this.loadAccountDetails();
        this.loadOperations();
      } else {
        this.error = "Identifiant de compte manquant";
        this.loading = false;
      }
    });
  }

  loadAccountDetails(): void {
    this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.account = account;
      },
      error: (error) => {
        this.notificationService.showError('Erreur lors du chargement des détails du compte');
      }
    });
  }
  loadOperations(): void {
    this.loading = true;
    this.error = null;
    
    this.transactionService.getAccountOperations(this.accountId).subscribe({
      next: (data) => {
        // Tri des opérations par date décroissante (plus récente d'abord)
        this.operations = data.sort((a, b) => {
          return new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime();
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des opérations';
        this.loading = false;
        console.error('Error loading operations:', error);
      }
    });
  }

  getOperationTypeClass(type: string): string {
    switch (type) {
      case 'CREDIT': return 'bg-green-100 text-green-800';
      case 'DEBIT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CREATED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVATED': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  }  formatUsername(email: string | null): string {
    if (!email) return 'Non spécifié';
    
    // Extrait le nom d'utilisateur de l'email (tout avant le @)
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;
    
    return email.substring(0, atIndex);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
