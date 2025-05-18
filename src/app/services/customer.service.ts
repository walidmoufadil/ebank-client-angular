import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly API_URL = 'http://localhost:8085';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Accept', 'application/json');
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.API_URL}/customers`, { 
      headers: this.getHeaders() 
    });
  }
  deleteCustomer(customerId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/customers/${customerId}`, {
      headers: this.getHeaders()
    });
  }

  createCustomer(customer: Omit<Customer, 'id'>): Observable<Customer> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.post<Customer>(`${this.API_URL}/customers`, customer, {
      headers
    });
  }
}
