import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TransactionService } from "../services/transaction.service";
import { AccountService } from "../services/account.service";
import { Transaction, TransactionHistory } from "../models/transaction.model";
import { BaseAccount } from "../models/account.model";
import { NotificationService } from "../services/notification.service";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-transaction-history",
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="bg-white shadow-md rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">Historique des transactions</h1>
          <button 
            (click)="goBack()" 
            class="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Retour
          </button>
        </div>
        
        <!-- Account Info Card -->
        <div *ngIf="account && !isLoading" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-medium text-gray-900">Compte {{ account.type === "CurrentAccount" ? "Courant" : "Épargne" }}</h2>
              <p class="text-sm text-gray-500">ID: {{ account.id }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-medium text-gray-900">{{ formatCurrency(account.balance) }}</p>
              <p class="text-sm text-gray-500">Solde actuel</p>
            </div>
          </div>
        </div>
        
        <div *ngIf="isLoading" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-600">Chargement des transactions...</p>
        </div>
        
        <div *ngIf="!isLoading && transactions.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune transaction trouvée</h3>
          <p class="mt-1 text-sm text-gray-500">Ce compte n'a pas encore d'historique de transactions.</p>
          <div class="mt-6">
            <button (click)="goBack()" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Retour à mes comptes
            </button>
          </div>
        </div>
        
        <div *ngIf="!isLoading && transactions.length > 0" class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-700">Type</th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-700">Date</th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-700">Montant</th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-700">Description</th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-700">Utilisateur</th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-700">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let transaction of transactions" class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b border-gray-200">
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': transaction.type === 'CREDIT',
                    'bg-red-100 text-red-800': transaction.type === 'DEBIT',
                    'bg-blue-100 text-blue-800': transaction.type === 'TRANSFER'
                  }" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getTransactionTypeLabel(transaction.type) }}
                  </span>
                </td>
                <td class="py-2 px-4 border-b border-gray-200">{{ formatDate(transaction.timestamp) }}</td>
                <td class="py-2 px-4 border-b border-gray-200" [ngClass]="{
                  'text-green-600': transaction.type === 'CREDIT',
                  'text-red-600': transaction.type === 'DEBIT',
                  'text-blue-600': transaction.type === 'TRANSFER'
                }">
                  {{ formatCurrency(transaction.amount) }}
                </td>
                <td class="py-2 px-4 border-b border-gray-200">{{ transaction.description || 'N/A' }}</td>
                <td class="py-2 px-4 border-b border-gray-200">
                  <span *ngIf="transaction.userId" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ formatUsername(transaction.userId) }}
                  </span>
                  <span *ngIf="!transaction.userId" class="text-gray-400">Non spécifié</span>
                </td>
                <td class="py-2 px-4 border-b border-gray-200">
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': transaction.status === 'COMPLETED',
                    'bg-yellow-100 text-yellow-800': transaction.status === 'PENDING',
                    'bg-red-100 text-red-800': transaction.status === 'FAILED'
                  }" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusLabel(transaction.status || 'UNKNOWN') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-gray-600">
              Affichage de {{ transactions.length > 0 ? (currentPage * pageSize) + 1 : 0 }} à {{ Math.min((currentPage + 1) * pageSize, totalItems) }} sur {{ totalItems }} transactions
            </div>
            <div class="flex space-x-1">
              <button 
                [disabled]="currentPage === 0"
                (click)="loadPage(0)"
                class="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md">
                Premier
              </button>
              <button 
                [disabled]="currentPage === 0"
                (click)="loadPage(currentPage - 1)"
                class="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Précédent
              </button>
              <button 
                [disabled]="(currentPage + 1) * pageSize >= totalItems"
                (click)="loadPage(currentPage + 1)"
                class="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Suivant
              </button>
              <button 
                [disabled]="(currentPage + 1) * pageSize >= totalItems"
                (click)="loadPage(Math.floor(totalItems / pageSize))"
                class="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md">
                Dernier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TransactionHistoryComponent implements OnInit {
  accountId: string = "";
  account: BaseAccount | null = null;
  transactions: Transaction[] = [];
  isLoading: boolean = true;
  currentPage: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  Math = Math; // To use Math in the template

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.accountId = params["id"];
      if (this.accountId) {
        this.loadAccountDetails();
        this.loadTransactions();
      } else {
        this.notificationService.showError("Identifiant de compte manquant");
        this.isLoading = false;
      }
    });
  }

  loadAccountDetails(): void {
    this.accountService.getAccountById(this.accountId).subscribe({
      next: (data) => {
        this.account = data;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des détails du compte", error);
        if (error.status === 403) {
          this.notificationService.showError("Vous n'avez pas l'autorisation d'accéder à ce compte");
          this.router.navigate(["/my-accounts"]);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(["/my-accounts"]);
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.transactionService.getAccountTransactions(this.accountId, this.currentPage, this.pageSize)
      .subscribe({
        next: (data: TransactionHistory) => {
          this.transactions = data.transactions;
          this.totalItems = data.totalItems;
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Erreur lors du chargement des transactions", error);
          this.notificationService.showError("Erreur lors du chargement des transactions: " + 
            (error.error?.message || "Veuillez réessayer plus tard"));
          this.isLoading = false;
          
          // If unauthorized, redirect to login
          if (error.status === 401) {
            this.router.navigate(["/login"]);
          }
        }
      });
  }

  loadPage(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }
  
  formatDate(dateString: string | undefined): string {
    if (!dateString) return "N/A";
    
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD"
    }).format(amount);
  }

  getTransactionTypeLabel(type: string): string {
    switch (type) {
      case "CREDIT":
        return "Crédit";
      case "DEBIT":
        return "Débit";
      case "TRANSFER":
        return "Virement";
      default:
        return type;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case "COMPLETED":
        return "Terminé";
      case "PENDING":
        return "En attente";
      case "FAILED":
        return "Échoué";
      case "UNKNOWN":
        return "Inconnu";
      default:
        return status;
    }
  }
  
  formatUsername(email: string | null | undefined): string {
    if (!email) return 'Non spécifié';
    
    // Extrait le nom d'utilisateur de l'email (tout avant le @)
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;
    
    return email.substring(0, atIndex);
  }
}
