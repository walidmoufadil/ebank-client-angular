import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, TransactionHistory } from '../models/transaction.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/accounts`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  performDebit(accountId: string, amount: number, description?: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/debit`, {
      accountId,
      amount,
      description: description || 'Débit'
    });
  }

  performCredit(accountId: string, amount: number, description?: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/credit`, {
      accountId,
      amount,
      description: description || 'Crédit'
    });
  }

  performTransfer(sourceAccountId: string, destinationAccountId: string, amount: number, description?: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transfer`, {
      accountSource: sourceAccountId,
      accountDestination: destinationAccountId,
      amount,
      description: description || 'Transfert'
    });
  }

  getAccountTransactions(accountId: string, page: number = 0, size: number = 10): Observable<TransactionHistory> {
    return this.http.get<TransactionHistory>(`${this.apiUrl}/account/${accountId}`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  getTransactionById(transactionId: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${transactionId}`);
  }
}
