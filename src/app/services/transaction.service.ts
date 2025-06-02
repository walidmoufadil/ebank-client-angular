import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction, TransactionHistory } from '../models/transaction.model';
import { Operation } from '../models/operation.model';
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
  performTransfer(sourceAccountId: string, destinationAccountId: string, amount: number, description?: string): Observable<Transaction | null> {
    return this.http.post<Transaction | null>(`${this.apiUrl}/transfer`, {
      accountSource: sourceAccountId,
      accountDestination: destinationAccountId,
      amount,
      description: description || 'Transfert'
    }, {
      observe: 'response'
    }).pipe(
      map(response => {
        // If the body is empty but status is 200, return a synthetic transaction object
        if (response.status === 200 && !response.body) {
          return {
            type: 'TRANSFER',
            amount: amount,
            description: description || 'Transfert',
            sourceAccountId: sourceAccountId,
            destinationAccountId: destinationAccountId,
            status: 'COMPLETED'
          } as Transaction;
        }
        return response.body;
      })
    );
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
  getAccountOperations(accountId: string): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.apiUrl}/${accountId}/operations`);
  }
  
  getAllAccountsOperations(accountIds: string[]): Observable<Map<string, Operation[]>> {
    // Utilise forkJoin pour faire des requêtes parallèles pour chaque compte
    const requests: Observable<{accountId: string, operations: Operation[]}>[] = accountIds.map(id => {
      return this.getAccountOperations(id).pipe(
        map(operations => ({ accountId: id, operations }))
      );
    });
    
    return forkJoin(requests).pipe(
      map(results => {
        const operationsMap = new Map<string, Operation[]>();
        results.forEach(result => {
          operationsMap.set(result.accountId, result.operations);
        });
        return operationsMap;
      })
    );
  }
}
