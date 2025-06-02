import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccount, AccountRequest, BaseAccount } from '../models/account.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }  getAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/accounts`);
  }
  
  getAccountById(id: string): Observable<BaseAccount> {
    return this.http.get<BaseAccount>(`${this.apiUrl}/accounts/${id}`);
  }
  
  createAccount(account: AccountRequest): Observable<BankAccount> {
    return this.http.post<BankAccount>(`${this.apiUrl}/accounts`, account);
  }
}
