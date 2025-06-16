import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { Api_userService } from '../../../services/api/api_user.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { CreateUser } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'],
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;
  submitting = false;
  error: string | null = null;
  isAuthorized = false;
  isAdmin = false;
  isHR = false;
  rolesList = [
    { id: 5, name: 'Employé' },
    { id: 4, name: 'CM' },
    { id: 3, name: 'Réparateur' },
    { id: 2, name: 'RH' },
    { id: 1, name: 'Admin' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: Api_userService,
    private authService: Api_authService
  ) {
    // Initialize form with a FormArray for roles
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: [''],
      roles: this.fb.array([], [Validators.required, Validators.minLength(1)]),
    });
  }

  ngOnInit(): void {
    // Check if user has admin or RH rights
    this.checkAuthorization();
  }

  checkAuthorization(): void {
    // Check if user is logged in and has admin or RH role
    if (this.authService.isLoggedIn()) {
      this.isAdmin = this.authService.hasRole('admin');
      this.isHR = this.authService.hasRole('rh');

      this.isAuthorized = this.isAdmin || this.isHR;

      if (!this.isAuthorized) {
        this.error =
          "Vous n'avez pas les droits nécessaires pour créer un utilisateur";
      }
    } else {
      // Redirect to login if not logged in
      this.router.navigate(['/login']);
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

    // Ne jamais permettre l'ajout du rôle client (id=6)
    if (roleId === 6) {
      return;
    }

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

    // Create user object based on CreateUser interface
    const userData: CreateUser = {
      first_name: this.userForm.value.first_name,
      last_name: this.userForm.value.last_name,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      phone: this.userForm.value.phone || null,
    }; // Get array of role IDs from the FormArray and filter out client role (id=6) if present
    const roles = this.rolesArray.value.filter(
      (roleId: number) => roleId !== 6
    );

    // Call service to create user
    this.userService.createUser(userData, roles).subscribe({
      next: (response) => {
        this.submitting = false;
        // Navigate to user list page after successful creation
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.error =
          "Erreur lors de la création de l'utilisateur. Veuillez réessayer.";
        this.submitting = false;
        console.error('Erreur:', err);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
