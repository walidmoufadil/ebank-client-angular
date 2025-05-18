import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Redirection vers le dashboard après connexion réussie
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.loginError = 'Identifiant ou mot de passe incorrect';
          } else {
            this.loginError = 'Une erreur est survenue, veuillez réessayer';
          }
        }
      });
    }
  }
}
