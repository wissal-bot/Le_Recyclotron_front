import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Api_authService } from '../../services/api_auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';

  constructor(@Inject(Api_authService) private authService: Api_authService) {}
  ngOnInit(): void {}

  onSubmit() {
    if (this.email && this.password) {
      this.authService
        .login({
          email: this.email,
          password: this.password,
        })
        .subscribe({
          next: (response: { jwt: string }) => {
            // Store JWT token and redirect
            localStorage.setItem('token', response.jwt);
            // TODO: Redirect to home page
          },
          error: (error: any) => {
            console.error('Login failed:', error);
            // TODO: Show error message to user
          },
        });
    }
  }
}
