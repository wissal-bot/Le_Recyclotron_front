import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Api_authService } from 'app/services/api_auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="auth-container">
      <div class="auth-card">
        <h2>Se connecter</h2>
        <form class="auth-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email :</label>
            <input 
              type="email" 
              class="form-input" 
              [(ngModel)]="email" 
              name="email"
              required>
          </div>
          <div class="form-group">
            <label>Mot de passe :</label>
            <input 
              type="password" 
              class="form-input" 
              [(ngModel)]="password"
              name="password"
              required>
          </div>
          <button type="submit" class="auth-button">Se connecter</button>
          <p class="auth-link">
            <a routerLink="/register">Pas de compte ? S'inscrire</a>
          </p>
        </form>
      </div>
    </section>
  `
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(@Inject(Api_authService) private authService: Api_authService) {}

  onSubmit() {
    if (this.email && this.password) {
      this.authService.login({
        email: this.email,
        password: this.password
      }).subscribe({
        next: (response: { jwt: string; }) => {
          // Store JWT token and redirect
          localStorage.setItem('token', response.jwt);
          // TODO: Redirect to home page
        },
        error: (error: any) => {
          console.error('Login failed:', error);
          // TODO: Show error message to user
        }
      });
    }
  }
}