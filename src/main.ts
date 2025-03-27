import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { IMAGE_CONFIG } from '@angular/common';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { ErrorHandler } from '@angular/core';

// Debug routes for troubleshooting
console.log('Available routes:', routes);

// Add global error handler
class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error handler:', error);

    // Handle JWT related errors
    if (error && error.message && error.message.includes('JWT')) {
      console.warn('JWT error detected, clearing token');
      localStorage.removeItem('token');
    }
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
}).catch((err) => console.error('Application bootstrap error:', err));
