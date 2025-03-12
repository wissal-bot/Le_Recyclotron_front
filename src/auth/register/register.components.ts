import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Api_authService } from '../../app/services/api_auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="auth-container">
      <div class="auth-card">
        <h2>S'inscrire</h2>
        <form class="auth-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nom :</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="firstName"
              name="firstName"
              required
            />
          </div>
          <div class="form-group">
            <label>Prénom :</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="lastName"
              name="lastName"
              required
            />
          </div>
          <div class="form-group">
            <label>Email :</label>
            <input
              type="email"
              class="form-input"
              [(ngModel)]="email"
              name="email"
              required
            />
          </div>
          <div class="form-group">
            <label>Téléphone :</label>
            <input
              type="tel"
              class="form-input"
              [(ngModel)]="phone"
              name="phone"
              required
            />
          </div>
          <div class="form-group">
            <label>Mot de passe :</label>
            <input
              type="password"
              class="form-input"
              [(ngModel)]="password"
              name="password"
              required
            />
          </div>
          <div class="form-group">
            <label>Confirmer le mot de passe :</label>
            <input
              type="password"
              class="form-input"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
            />
          </div>
          <button type="submit" class="auth-button">S'inscrire</button>
          <p class="auth-link">
            <a routerLink="/login">Déjà inscrit ? Se connecter</a>
          </p>
        </form>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(@Inject(Api_authService) private authService: Api_authService) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      // TODO: Show error message to user
      return;
    }

    if (this.email && this.password) {
      this.authService
        .register({
          email: this.email,
          password: this.password,
        })
        .subscribe({
          next: (response: any) => {
            // TODO: Show success message and redirect to login
          },
          error: (error: any) => {
            console.error('Registration failed:', error);
            // TODO: Show error message to user
          },
        });
    }
  }
}
