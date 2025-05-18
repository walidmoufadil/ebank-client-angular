import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BaseAccount } from '../models/account.model';

type TransactionType = 'DEBIT' | 'CREDIT' | 'TRANSFER';

export interface TransactionDialogData {
  type: TransactionType;
  account: BaseAccount;
  accounts?: BaseAccount[];
}

interface TransactionResult {
  type: TransactionType;
  sourceAccountId: string;
  amount: number;
  description?: string;
  destinationAccountId?: string;
}

@Component({
  selector: 'app-transaction-dialog',
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
      <h2 class="text-2xl font-bold mb-4">
        {{ getTitle() }}
      </h2>
      
      <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div *ngIf="data.type === 'TRANSFER'" class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Destination Account</mat-label>
            <mat-select formControlName="destinationAccountId">
              <mat-option *ngFor="let account of data.accounts" [value]="account.id">
                {{ account.id }} (Balance: {{ account.balance | currency }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="transactionForm.get('destinationAccountId')?.hasError('required')">
              Destination account is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Amount</mat-label>
            <input matInput type="number" formControlName="amount" min="0" step="0.01">
            <mat-error *ngIf="transactionForm.get('amount')?.hasError('required')">
              Amount is required
            </mat-error>
            <mat-error *ngIf="transactionForm.get('amount')?.hasError('min')">
              Amount must be greater than 0
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
        </div>

        <div class="flex justify-end space-x-2">
          <button mat-button type="button" (click)="onCancel()">
            Cancel
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="transactionForm.invalid">
            Confirm
          </button>
        </div>
      </form>
    </div>
  `
})
export class TransactionDialogComponent {
  transactionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TransactionDialogData
  ) {
    this.transactionForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: [''],
      destinationAccountId: [null]
    });

    if (data.type === 'TRANSFER') {
      this.transactionForm.get('destinationAccountId')?.setValidators(Validators.required);
    }
  }

  getTitle(): string {
    switch (this.data.type) {
      case 'DEBIT':
        return 'Withdraw Money';
      case 'CREDIT':
        return 'Deposit Money';
      case 'TRANSFER':
        return 'Transfer Money';
      default:
        return 'Transaction';
    }
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      const result: TransactionResult = {
        type: this.data.type,
        sourceAccountId: this.data.account.id,
        amount: formValue.amount,
        description: formValue.description || undefined
      };
      
      if (this.data.type === 'TRANSFER') {
        result.destinationAccountId = formValue.destinationAccountId;
      }
      
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
