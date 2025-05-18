import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading: boolean = true;
  error: string | null = null;
  showDeleteModal = false;
  customerToDelete: Customer | null = null;

  constructor(
    private customerService: CustomerService,
    public router: Router,  // Changed from private to public to allow template access
    private notificationService: NotificationService  ) {}
  deletingCustomer = false;

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des clients';
        this.loading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  confirmDelete(customer: Customer): void {
    this.customerToDelete = customer;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.customerToDelete = null;
    this.showDeleteModal = false;
  }

  proceedWithDelete(): void {
    if (!this.customerToDelete) return;

    this.deletingCustomer = true;
    this.customerService.deleteCustomer(this.customerToDelete.id)
      .pipe(finalize(() => {
        this.deletingCustomer = false;
        this.showDeleteModal = false;
      }))
      .subscribe({
        next: () => {          const deletedCustomer = this.customerToDelete;
          this.customers = this.customers.filter(c => c.id !== deletedCustomer?.id);
          this.notificationService.showSuccess(`Le client ${deletedCustomer?.name} a été supprimé avec succès`);
          this.customerToDelete = null;
        },
        error: (error) => {
          this.error = 'Erreur lors de la suppression du client';
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
          this.customerToDelete = null;
        }
      });
  }
}
