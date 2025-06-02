import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AccountRequest } from '../models/account.model';
import { Customer } from '../models/customer.model';

export interface AccountDialogData {
  customers: Customer[];
}

@Component({
  selector: 'app-account-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Créer un nouveau compte</h2>
      
      <form [formGroup]="accountForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Client</mat-label>
            <mat-select formControlName="customerId" required>
              <mat-option *ngFor="let customer of data.customers" [value]="customer.id">
                {{ customer.name }} ({{ customer.email }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="accountForm.get('customerId')?.hasError('required')">
              Le client est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Type de compte</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="current">Compte Courant</mat-option>
              <mat-option value="saving">Compte Épargne</mat-option>
            </mat-select>
            <mat-error *ngIf="accountForm.get('type')?.hasError('required')">
              Le type de compte est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Solde initial</mat-label>
            <input matInput type="number" formControlName="initialBalance" min="0" step="0.01">
            <mat-error *ngIf="accountForm.get('initialBalance')?.hasError('required')">
              Le solde initial est requis
            </mat-error>
            <mat-error *ngIf="accountForm.get('initialBalance')?.hasError('min')">
              Le solde initial doit être supérieur à 0
            </mat-error>
          </mat-form-field>
        </div>

        <div *ngIf="accountForm.get('type')?.value === 'current'" class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Découvert autorisé</mat-label>
            <input matInput type="number" formControlName="overDraft" min="0" step="0.01">
            <mat-error *ngIf="accountForm.get('overDraft')?.hasError('required')">
              Le découvert autorisé est requis
            </mat-error>
            <mat-error *ngIf="accountForm.get('overDraft')?.hasError('min')">
              Le découvert doit être supérieur ou égal à 0
            </mat-error>
          </mat-form-field>
        </div>

        <div *ngIf="accountForm.get('type')?.value === 'saving'" class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Taux d'intérêt (%)</mat-label>
            <input matInput type="number" formControlName="interestRate" min="0" max="100" step="0.01">
            <mat-error *ngIf="accountForm.get('interestRate')?.hasError('required')">
              Le taux d'intérêt est requis
            </mat-error>
            <mat-error *ngIf="accountForm.get('interestRate')?.hasError('min') || accountForm.get('interestRate')?.hasError('max')">
              Le taux d'intérêt doit être entre 0 et 100
            </mat-error>
          </mat-form-field>
        </div>

        <div class="flex justify-end space-x-2">
          <button mat-button type="button" (click)="onCancel()">
            Annuler
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="accountForm.invalid">
            Créer
          </button>
        </div>
      </form>
    </div>
  `
})
export class AccountDialogComponent {
  accountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccountDialogData
  ) {
    this.accountForm = this.fb.group({
      customerId: ['', Validators.required],
      type: ['current', Validators.required],
      initialBalance: [1000, [Validators.required, Validators.min(0)]],
      overDraft: [0, [Validators.required, Validators.min(0)]],
      interestRate: [0, [Validators.min(0), Validators.max(100)]]
    });

    // Update validators based on account type
    this.accountForm.get('type')?.valueChanges.subscribe(type => {
      const overDraftControl = this.accountForm.get('overDraft');
      const interestRateControl = this.accountForm.get('interestRate');
      
      if (type === 'current') {
        overDraftControl?.setValidators([Validators.required, Validators.min(0)]);
        interestRateControl?.clearValidators();
      } else {
        interestRateControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        overDraftControl?.clearValidators();
      }
      
      overDraftControl?.updateValueAndValidity();
      interestRateControl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      const formValue = this.accountForm.value;
      const accountRequest: AccountRequest = {
        customerId: formValue.customerId,
        type: formValue.type,
        initialBalance: formValue.initialBalance
      };

      if (formValue.type === 'current') {
        accountRequest.overDraft = formValue.overDraft;
      } else {
        accountRequest.interestRate = formValue.interestRate;
      }
      
      this.dialogRef.close(accountRequest);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
