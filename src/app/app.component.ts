import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationComponent } from './shared/notification.component';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PasswordChangeDialogComponent } from './components/password-change-dialog.component';
import { NotificationService } from './services/notification.service';
import { PasswordChangeRequest } from './models/auth.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NotificationComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isUserMenuOpen = false;
  username = '';
  
  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.username = this.authService.getCurrentUserName();
      }
    });
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Fermer le menu si on clique en dehors
    if (!target.closest('.user-menu-container') && this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isUserMenuOpen = false;
  }

  openPasswordChangeDialog(): void {
    const dialogRef = this.dialog.open(PasswordChangeDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe((result: PasswordChangeRequest) => {
      if (result) {
        this.authService.changePassword(result).subscribe({
          next: () => {
            this.notificationService.showSuccess('Mot de passe changé avec succès');
          },
          error: (error) => {
            this.notificationService.showError(error.error?.message || 'Erreur lors du changement de mot de passe');
          }
        });
      }
    });
    this.isUserMenuOpen = false;
  }
}
