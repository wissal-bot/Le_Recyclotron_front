import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api_authService } from '../services/api/api_auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading: boolean = true;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: Api_authService, private router: Router) {}

  ngOnInit(): void {
    // Fetch user data directly from API
    this.fetchUserData();
  }

  fetchUserData(): void {
    this.loading = true;
    this.error = null;

    this.authService.getCurrentUser().subscribe({
      next: (response: any) => {
        // Properly handle the response structure
        if (response && response.data) {
          this.user = response.data;
        } else {
          this.user = response;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.error = 'Impossible de récupérer les informations utilisateur.';
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
