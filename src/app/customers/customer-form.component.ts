import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Nouveau Client
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="customerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Error Alert -->
            <div *ngIf="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
            
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <div class="mt-1">
                <input id="name" type="text" formControlName="name" required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  [ngClass]="{'border-red-500': customerForm.get('name')?.invalid && customerForm.get('name')?.touched}">
              </div>
              <p *ngIf="customerForm.get('name')?.invalid && customerForm.get('name')?.touched" 
                 class="mt-2 text-sm text-red-600">
                Le nom est requis
              </p>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div class="mt-1">
                <input id="email" type="email" formControlName="email" required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  [ngClass]="{'border-red-500': customerForm.get('email')?.invalid && customerForm.get('email')?.touched}">
              </div>
              <p *ngIf="customerForm.get('email')?.invalid && customerForm.get('email')?.touched" 
                 class="mt-2 text-sm text-red-600">
                Un email valide est requis
              </p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div class="mt-1">
                <input id="password" type="password" formControlName="password" required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  [ngClass]="{'border-red-500': customerForm.get('password')?.invalid && customerForm.get('password')?.touched}">
              </div>
              <p *ngIf="customerForm.get('password')?.invalid && customerForm.get('password')?.touched" 
                 class="mt-2 text-sm text-red-600">
                Le mot de passe doit faire au moins 6 caractères
              </p>
            </div>

            <div class="flex items-center justify-between space-x-3">
              <button type="button" (click)="cancel()"
                class="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Annuler
              </button>
              <button type="submit" [disabled]="!customerForm.valid || isSubmitting"
                class="flex-1 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? 'Création...' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CustomerFormComponent {
  customerForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.customerForm.valid) {
      this.isSubmitting = true;
      this.error = null;      this.customerService.createCustomer(this.customerForm.value)
        .subscribe({
          next: (customer) => {
            this.notificationService.showSuccess(`Le client ${customer.name} a été créé avec succès`);
            this.router.navigate(['/customers']);
          },
          error: (error) => {
            this.isSubmitting = false;
            if (error.status === 401) {
              this.router.navigate(['/login']);
            } else {
              this.error = 'Erreur lors de la création du client. Veuillez réessayer.';
            }
          }
        });
    }
  }

  cancel() {
    this.router.navigate(['/customers']);
  }
}
