import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <header class="header">
      <button class="menu-button">
        <div class="menu-line"></div>
        <div class="menu-line"></div>
        <div class="menu-line"></div>
      </button>
      <h1 class="title">LE RECYCLOTRON</h1>
      <div class="header-actions">
        <a routerLink="/login" class="auth-link">Se connecter</a>
        <img src="assets/logo-recycle.png" alt="Logo Recyclotron" class="logo">
      </div>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <nav class="footer-nav">
        <a routerLink="/" class="footer-link">Accueil</a>
        <a routerLink="/contact" class="footer-link">Contact</a>
        <a routerLink="/politique" class="footer-link">Politique et confidentialité</a>
        <a routerLink="/cgu" class="footer-link">CGU</a>
      </nav>
      <div class="social-icons">
        <a href="#" class="social-link"><img src="assets/instagram.png" alt="Instagram"></a>
        <a href="#" class="social-link"><img src="assets/facebook.png" alt="Facebook"></a>
        <a href="#" class="social-link"><img src="assets/linkedin.png" alt="LinkedIn"></a>
        <a href="#" class="social-link"><img src="assets/twitter.png" alt="Twitter"></a>
      </div>
    </footer>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AppComponent {
  title = 'Le Recyclotron';
}