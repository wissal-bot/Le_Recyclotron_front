import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api_authService } from '../services/api/api_auth.service';
import { ClickOutsideDirective } from '../directives/click-outside.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ClickOutsideDirective],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuActive = false;
  profileMenuOpen = false;
  isLoggedIn = false;
  userName: string | null = null;
  userEmail: string | null = null;
  userProfileImage: string | null = null;
  hasClientRole: boolean = false;

  constructor(private authService: Api_authService) {}

  ngOnInit(): void {
    // Subscribe to auth status changes
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;

      if (loggedIn) {
        const userInfo = this.authService.getUserFromToken();
        // Use first_name and last_name instead of name
        this.userName = userInfo?.first_name
          ? `${userInfo.first_name} ${userInfo.last_name || ''}`
          : 'Utilisateur';
        this.userEmail = userInfo?.email || '';
        this.userProfileImage = userInfo?.profileImage || null;
      } else {
        this.userName = null;
        this.userEmail = null;
        this.userProfileImage = null;
      }
    });

    // S'abonner aux changements d'état d'authentification
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;

      if (loggedIn) {
        const user = this.authService.getUserFromToken();
        
        // Vérifier si l'utilisateur a le rôle "client"
        if (user && user.roles) {
          this.hasClientRole = user.roles.includes('client');
        } else {
          this.hasClientRole = false;
        }

        // Mettre à jour les informations de l'utilisateur
        this.userName = user.name || user.first_name || 'Utilisateur';
        this.userEmail = user.email || '';
        this.userProfileImage = user.profileImage || '';
      } else {
        this.hasClientRole = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup logic if needed
  }

  toggleMenu(): void {
    this.menuActive = !this.menuActive;
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  logout(): void {
    this.profileMenuOpen = false;
    this.authService.logout();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.profile-dropdown');

    if (dropdown && !dropdown.contains(target)) {
      this.profileMenuOpen = false;
    }
  }
}
