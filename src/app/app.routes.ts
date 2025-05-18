import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CustomersComponent } from './customers/customers.component';
import { AccountsComponent } from './accounts/accounts.component';
import { CustomerFormComponent } from './customers/customer-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'customers/new', component: CustomerFormComponent },
  { path: 'accounts', component: AccountsComponent }
];
