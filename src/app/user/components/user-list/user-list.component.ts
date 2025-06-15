import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Api_userService } from '../../../services/api/api_user.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { User } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;
  isAuthorized = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Roles
  isAdmin = false;
  isHR = false;
  constructor(
    private userService: Api_userService,
    private authService: Api_authService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthorization();
    if (this.isAuthorized) {
      this.loadUsers();
    }
  }
  checkAuthorization(): void {
    console.log('Checking authorization...');
    console.log('Is logged in:', this.authService.isLoggedIn());

    if (this.authService.isLoggedIn()) {
      this.isAdmin = this.authService.hasRole('admin');
      this.isHR = this.authService.hasRole('rh');
      this.isAuthorized = this.isAdmin || this.isHR;

      console.log('isAdmin:', this.isAdmin);
      console.log('isHR:', this.isHR);
      console.log('isAuthorized:', this.isAuthorized);

      if (!this.isAuthorized) {
        this.error =
          "Vous n'avez pas les droits nécessaires pour accéder à cette page";
      }
    } else {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      this.error = 'Vous devez être connecté pour accéder à cette page';
      this.router.navigate(['/login']);
    }
  }
  loadUsers(): void {
    this.loading = true;
    this.error = null;

    console.log('Tentative de chargement des utilisateurs via API...');

    // Utiliser l'API pour récupérer les utilisateurs
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log("Utilisateurs récupérés de l'API:", users);

        // Logger des informations détaillées pour comprendre la structure
        if (users && users.length > 0) {
          console.log('Premier utilisateur:', JSON.stringify(users[0]));
        }

        // Vérifier que les utilisateurs sont conformes à l'interface User
        this.users = this.validateUsers(users);
        this.totalItems = this.users.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.error =
          "Erreur lors du chargement des utilisateurs. Vérifiez que l'API est accessible.";
        this.loading = false;
      },
    });
  }

  // Méthode pour valider et corriger les données des utilisateurs
  validateUsers(users: any[]): User[] {
    if (!Array.isArray(users)) {
      console.error('Les données reçues ne sont pas un tableau:', users);
      return [];
    }

    return users.map((user) => {
      // S'assurer que l'utilisateur a tous les champs requis
      const validUser: User = {
        id: user.id?.toString() || '',
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        email: user.email || '',
        roles: [],
      };

      // Vérifier et transformer les rôles si nécessaire
      if (Array.isArray(user.roles)) {
        validUser.roles = user.roles.map((role: any) => ({
          id: typeof role.id === 'number' ? role.id : parseInt(role.id) || 0,
          name: role.name || role.roleName || 'Rôle inconnu',
        }));
      }

      return validUser;
    });
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.users.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
