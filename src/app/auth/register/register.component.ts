import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Api_authService } from '../../services/api_auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(@Inject(Api_authService) private authService: Api_authService) {}

  ngOnInit() {}

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
