import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { IMAGE_CONFIG } from '@angular/common';

// Debug routes for troubleshooting
console.log('Available routes:', routes);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideAnimations(),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
}).catch((err) => console.error(err));
