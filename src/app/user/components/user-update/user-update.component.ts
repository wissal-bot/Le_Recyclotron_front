import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { Api_userService } from '../../../services/api/api_user.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { User, UpdateUser } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-update.component.html',
  styleUrl: './user-update.component.css',
})
export class UserUpdateComponent implements OnInit {
  userForm: FormGroup;
  userId: string = '';
  user: User | null = null;
  submitting = false;
  error: string | null = null;
  isAuthorized = false;
  isAdmin = false;
  isHR = false;
  rolesList = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'rh' },
    { id: 3, name: 'repairer' },
    { id: 4, name: 'cm' },
    { id: 5, name: 'employee' },
    { id: 6, name: 'client' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: Api_userService,
    private authService: Api_authService
  ) {
    // Initialize form with a FormArray for roles
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Optional for update
      phone: [''],
      roles: this.fb.array([], [Validators.required, Validators.minLength(1)]),
    });
  }

  ngOnInit(): void {
    // Check if user has admin or RH rights
    this.checkAuthorization();

    // Get user ID from route
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId) {
        this.loadUser();
      } else {
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
          "Vous n'avez pas les droits nécessaires pour modifier un utilisateur";
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
        this.patchFormWithUserData();
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des données de l'utilisateur.";
        console.error('Erreur:', err);
      },
    });
  }

  patchFormWithUserData(): void {
    if (!this.user) return;

    // Clear the roles FormArray
    while (this.rolesArray.length !== 0) {
      this.rolesArray.removeAt(0);
    }

    // Patch form with user data
    this.userForm.patchValue({
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      email: this.user.email,
      // Don't patch password
      phone: '',
    });

    // Add each role to the FormArray
    if (this.user.roles && this.user.roles.length > 0) {
      this.user.roles.forEach((role) => {
        this.addRole(role.id);
      });
    }
  }

  // Getter for the roles FormArray
  get rolesArray(): FormArray {
    return this.userForm.get('roles') as FormArray;
  }

  // Check if a role is selected
  isRoleSelected(roleId: number): boolean {
    return this.rolesArray.controls.some((control) => control.value === roleId);
  }

  // Toggle selection of a role
  onRoleToggle(roleId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.addRole(roleId);
    } else {
      this.removeRole(roleId);
    }
  }

  // Add a role ID to the FormArray
  addRole(roleId: number): void {
    if (!this.isRoleSelected(roleId)) {
      this.rolesArray.push(this.fb.control(roleId));
    }
  }

  // Remove a role ID from the FormArray
  removeRole(roleId: number): void {
    for (let i = this.rolesArray.length - 1; i >= 0; i--) {
      if (this.rolesArray.at(i).value === roleId) {
        this.rolesArray.removeAt(i);
        break;
      }
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.userForm.controls).forEach((key) => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    const newRoleIds = this.rolesArray.value;

    console.log("Démarrage de la mise à jour de l'utilisateur");
    console.log('Rôles sélectionnés:', newRoleIds);

    // Mise à jour des informations utilisateur d'abord, puis mise à jour des rôles
    this.updateUserInfo(newRoleIds);
  }

  updateUserInfo(newRoleIds: number[]): void {
    // Create user update object
    const userData: UpdateUser = {
      first_name: this.userForm.value.first_name,
      last_name: this.userForm.value.last_name,
      email: this.userForm.value.email,
      phone: this.userForm.value.phone || null,
    };

    // Only include password if it was changed
    if (this.userForm.value.password) {
      userData.password = this.userForm.value.password;
    }

    console.log('Mise à jour des informations utilisateur:', userData);

    // Update user data
    this.userService.updateUser(this.userId, userData).subscribe({
      next: () => {
        console.log('Informations utilisateur mises à jour avec succès');
        // Une fois les informations utilisateur mises à jour, procéder à la mise à jour des rôles
        this.updateUserRoles(newRoleIds);
      },
      error: (err) => {
        this.error = "Erreur lors de la mise à jour de l'utilisateur.";
        this.submitting = false;
        console.error('Erreur lors de la mise à jour des informations:', err);
      },
    });
  }

  updateUserRoles(newRoleIds: number[]): void {
    console.log('Mise à jour des rôles:', newRoleIds);

    const currentRoles = this.user?.roles || [];
    console.log('Rôles actuels:', currentRoles);

    // Déterminer les rôles à supprimer (actuels mais pas dans newRoleIds)
    const rolesToRemove = currentRoles.filter(
      (role) => !newRoleIds.includes(role.id)
    );
    console.log('Rôles à supprimer:', rolesToRemove);

    if (rolesToRemove.length === 0) {
      console.log(
        'Aucun rôle à supprimer, ajout des nouveaux rôles directement'
      );
      this.addNewRoles(newRoleIds);
    } else {
      console.log(`${rolesToRemove.length} rôle(s) à supprimer`);
      this.removeRolesSequentially(rolesToRemove, 0, newRoleIds);
    }
  }
  removeRolesSequentially(
    rolesToRemove: any[],
    index: number,
    newRoleIds: number[]
  ): void {
    if (index >= rolesToRemove.length) {
      console.log('Tous les rôles à supprimer ont été traités');
      this.addNewRoles(newRoleIds);
      return;
    }

    const role = rolesToRemove[index];

    // Vérifier que le rôle est valide avant de tenter de le supprimer
    if (!role || !role.id) {
      console.error(`Rôle invalide à l'index ${index}:`, role);
      // Passer au rôle suivant
      this.removeRolesSequentially(rolesToRemove, index + 1, newRoleIds);
      return;
    }

    console.log(`Suppression du rôle ${role.name} (ID: ${role.id})`);

    // Ajouter un délai plus long pour s'assurer que les requêtes sont bien traitées
    setTimeout(() => {
      this.userService
        .removeRoleFromUser(this.userId, role.id.toString())
        .subscribe({
          next: () => {
            console.log(
              `Rôle ${role.name} (ID: ${role.id}) supprimé avec succès`
            );
            // Ajouter un petit délai avant de passer au rôle suivant
            setTimeout(() => {
              this.removeRolesSequentially(
                rolesToRemove,
                index + 1,
                newRoleIds
              );
            }, 300);
          },
          error: (err) => {
            console.error(
              `Erreur lors de la suppression du rôle ${role.name} (ID: ${role.id}):`,
              err
            );
            // Attendre un peu plus longtemps en cas d'erreur avant de continuer
            setTimeout(() => {
              this.removeRolesSequentially(
                rolesToRemove,
                index + 1,
                newRoleIds
              );
            }, 500);
          },
        });
    }, 800); // Délai plus long entre les requêtes pour éviter les problèmes de race condition
  }
  addNewRoles(roleIds: number[]): void {
    if (!roleIds || roleIds.length === 0) {
      console.log('Aucun rôle à ajouter, fin de la mise à jour');
      this.submitting = false;
      this.router.navigate(['/users']);
      return;
    }

    console.log('Ajout des nouveaux rôles:', roleIds);

    // Augmenter le délai avant d'ajouter les nouveaux rôles pour s'assurer que toutes les suppressions ont été traitées
    setTimeout(() => {
      // Filtrer les rôles valides (uniquement des nombres positifs)
      const validRoleIds = roleIds.filter(
        (id) => typeof id === 'number' && id > 0
      );

      if (validRoleIds.length === 0) {
        console.log('Aucun rôle valide à ajouter, fin de la mise à jour');
        this.submitting = false;
        this.router.navigate(['/users']);
        return;
      }

      console.log("Envoi des rôles valides à l'API:", validRoleIds);

      this.userService.addUserRoles(this.userId, validRoleIds).subscribe({
        next: () => {
          console.log('Nouveaux rôles ajoutés avec succès');
          this.submitting = false;
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error("Erreur lors de l'ajout des rôles:", err);
          this.error = 'Erreur lors de la mise à jour des rôles.';
          this.submitting = false;
        },
      });
    }, 800); // Délai plus long pour s'assurer que les suppressions sont bien enregistrées
  }

  /**
   * Note concernant l'erreur CORS:
   *
   * L'erreur CORS rencontrée indique que le serveur backend ne traite pas correctement
   * l'en-tête "Authorization" avec la configuration CORS actuelle.
   *
   * Pour résoudre ce problème côté serveur:
   * 1. Modifier la configuration CORS du serveur pour spécifier explicitement "Authorization"
   *    dans les en-têtes autorisés au lieu d'utiliser le caractère générique "*".
   *
   * Exemple de configuration Express.js:
   * ```
   * app.use(cors({
   *   origin: 'http://localhost:4200',
   *   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   *   allowedHeaders: ['Content-Type', 'Authorization']
   * }));
   * ```
   *
   * 2. Si vous utilisez un autre framework ou serveur, consultez sa documentation
   *    pour configurer correctement les en-têtes CORS.
   */

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
