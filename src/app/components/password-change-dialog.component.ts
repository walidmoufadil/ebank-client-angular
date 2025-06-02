import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-password-change-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Changer votre mot de passe</h2>
      
      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Mot de passe actuel</mat-label>
            <input matInput type="password" formControlName="oldPassword" [type]="hideOldPassword ? 'password' : 'text'">
            <button type="button" mat-icon-button matSuffix (click)="hideOldPassword = !hideOldPassword">
              <mat-icon>{{hideOldPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="passwordForm.get('oldPassword')?.hasError('required')">
              Le mot de passe actuel est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Nouveau mot de passe</mat-label>
            <input matInput type="password" formControlName="newPassword" [type]="hideNewPassword ? 'password' : 'text'">
            <button type="button" mat-icon-button matSuffix (click)="hideNewPassword = !hideNewPassword">
              <mat-icon>{{hideNewPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
              Le nouveau mot de passe est requis
            </mat-error>
            <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
              Le mot de passe doit contenir au moins 6 caractères
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field class="w-full">
            <mat-label>Confirmer le nouveau mot de passe</mat-label>
            <input matInput type="password" formControlName="confirmPassword" [type]="hideConfirmPassword ? 'password' : 'text'">
            <button type="button" mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword">
              <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
              La confirmation du mot de passe est requise
            </mat-error>
            <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
              Les mots de passe ne correspondent pas
            </mat-error>
          </mat-form-field>
        </div>

        <div class="flex justify-end space-x-2 mt-6">
          <button mat-button type="button" (click)="onCancel()">
            Annuler
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="passwordForm.invalid">
            Changer le mot de passe
          </button>
        </div>
      </form>
    </div>
  `
})
export class PasswordChangeDialogComponent {
  passwordForm: FormGroup;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PasswordChangeDialogComponent>
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.checkPasswords });
  }

  checkPasswords(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.dialogRef.close({
        oldPassword: this.passwordForm.value.oldPassword,
        newPassword: this.passwordForm.value.newPassword
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
