import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // If we have a token, add it to the request headers
    if (token) {
      try {
        // Validate JWT format
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.error('Invalid token format in interceptor');
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
          return next.handle(request);
        }

        const clonedRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });

        return next.handle(clonedRequest).pipe(
          catchError((error: HttpErrorResponse) => {
            // Handle 401 Unauthorized errors (expired or invalid token)
            if (error.status === 401) {
              // Clear the token and redirect to login
              localStorage.removeItem('token');
              this.router.navigate(['/login']);
            }
            return throwError(() => error);
          })
        );
      } catch (e) {
        console.error('Error in auth interceptor:', e);
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
        return next.handle(request);
      }
    }

    // If no token, just pass the request through
    return next.handle(request);
  }
}
