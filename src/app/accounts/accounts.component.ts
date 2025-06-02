import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AccountService } from '../services/account.service';
import { CustomerService } from '../services/customer.service';
import { TransactionService } from '../services/transaction.service';
import { BaseAccount, CurrentAccount, SavingAccount, AccountRequest } from '../models/account.model';
import { TransactionDialogComponent } from '../components/transaction-dialog.component';
import { AccountDialogComponent } from '../components/account-dialog.component';
import { NotificationService } from '../services/notification.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Customer } from '../models/customer.model';

@Component({
  selector: 'app-accounts',
  standalone: true,  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterLink,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent implements OnInit {
  accounts: BaseAccount[] = [];
  loading: boolean = true;
  error: string | null = null;
  customers: Customer[] = [];

  constructor(
    private accountService: AccountService,
    private customerService: CustomerService,
    private transactionService: TransactionService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadCustomers();
  }

  private loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des comptes';
        this.loading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        this.notificationService.showError('Erreur lors du chargement des clients');
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
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

  getStatusColor(status: string): string {
    switch (status) {
      case 'CREATED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVATED': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  openTransactionDialog(account: BaseAccount, type: 'DEBIT' | 'CREDIT' | 'TRANSFER'): void {
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      width: '500px',
      data: {
        type,
        account,
        accounts: type === 'TRANSFER' ? this.accounts.filter(a => a.id !== account.id) : undefined
      }
    });    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.processTransaction(result);
      }
    });
  }
  private processTransaction(transaction: any): void {
    const amount = parseFloat(transaction.amount);
    
    switch (transaction.type) {
      case 'DEBIT':
        this.transactionService.performDebit(
          transaction.sourceAccountId,
          amount,
          transaction.description
        ).subscribe({
          next: this.handleTransactionResponse.bind(this),
          error: (error) => {
            this.notificationService.showError(error.error.message || 'La transaction a échoué');
          }
        });
        break;
        
      case 'CREDIT':
        this.transactionService.performCredit(
          transaction.sourceAccountId,
          amount,
          transaction.description
        ).subscribe({
          next: this.handleTransactionResponse.bind(this),
          error: (error) => {
            this.notificationService.showError(error.error.message || 'La transaction a échoué');
          }
        });
        break;
          case 'TRANSFER':
        this.transactionService.performTransfer(
          transaction.sourceAccountId,
          transaction.destinationAccountId,
          amount,
          transaction.description
        ).subscribe({
          next: (response) => {
            this.handleTransactionResponse(response);
            // Recharger les comptes pour mettre à jour les soldes des deux comptes
            this.loadAccounts();
          },
          error: (error) => {
            this.notificationService.showError(error.error.message || 'Le transfert a échoué');
          }
        });
        break;
    }
  }  private handleTransactionResponse(response: any): void {
    // The response will always be truthy now due to our changes in the transaction service
    this.notificationService.showSuccess('Transaction completed successfully');
    this.loadAccounts(); // Reload accounts to show updated balances
  }

  getAccountTypeSpecificValue(account: BaseAccount): string {
    if (account.type === 'CurrentAccount') {
      return this.formatCurrency((account as CurrentAccount).overDraft);
    } else {
      return (account as SavingAccount).interestRate + '%';
    }
  }

  getAccountTypeSpecificLabel(account: BaseAccount): string {
    return account.type === 'CurrentAccount' ? 'Découvert autorisé' : 'Taux d\'intérêt';
  }

  openNewAccountDialog(): void {
    const dialogRef = this.dialog.open(AccountDialogComponent, {
      width: '500px',
      data: { 
        customers: this.customers
      }
    });

    dialogRef.afterClosed().subscribe((accountRequest: AccountRequest) => {
      if (accountRequest) {
        this.createAccount(accountRequest);
      }
    });
  }

  private createAccount(accountRequest: AccountRequest): void {
    this.loading = true;
    this.accountService.createAccount(accountRequest).subscribe({
      next: (account) => {
        this.notificationService.showSuccess('Le compte a été créé avec succès');
        this.loadAccounts();
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.showError(error.error.message || 'Erreur lors de la création du compte');
      }
    });
  }
}
