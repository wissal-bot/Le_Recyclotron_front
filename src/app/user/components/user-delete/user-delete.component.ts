import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Api_userService } from '../../../services/api/api_user.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { User } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-user-delete',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-delete.component.html',
  styleUrl: './user-delete.component.css',
})
export class UserDeleteComponent implements OnInit {
  userId: string = '';
  user: User | null = null;
  deleting = false;
  error: string | null = null;
  isAuthorized = false;
  isAdmin = false;
  isHR = false;
  success = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: Api_userService,
    private authService: Api_authService
  ) {}

  ngOnInit(): void {
    // Check if user has admin or RH rights
    this.checkAuthorization();

    // Get user ID from route
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId && this.isAuthorized) {
        this.loadUser();
      } else if (!this.userId) {
        this.router.navigate(['/users']);
      }
    });
  }

  checkAuthorization(): void {
    // Check if user is logged in and has admin or RH role
    if (this.authService.isLoggedIn()) {
      this.isAdmin = this.authService.hasRole('admin');
      this.isHR = this.authService.hasRole('rh');

      this.isAuthorized = this.isAdmin || this.isHR;

      if (!this.isAuthorized) {
        this.error =
          "Vous n'avez pas les droits nécessaires pour supprimer un utilisateur";
      }
    } else {
      // Redirect to login if not logged in
      this.router.navigate(['/login']);
    }
  }

  loadUser(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des données de l'utilisateur.";
        console.error('Erreur:', err);
      },
    });
  }

  confirmDelete(): void {
    this.deleting = true;
    this.error = null;

    this.userService.deleteUser(this.userId).subscribe({
      next: () => {
        this.deleting = false;
        this.success = true;
        // Navigate after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 2000);
      },
      error: (err) => {
        this.error = "Erreur lors de la suppression de l'utilisateur.";
        this.deleting = false;
        console.error('Erreur:', err);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  getRoleNames(): string {
    if (!this.user || !this.user.roles || this.user.roles.length === 0) {
      return '';
    }
    return this.user.roles.map((role) => role.name).join(', ');
  }
}
