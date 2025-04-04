import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductComponent } from './product/product.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProfileComponent } from './profile/profile.component';
import { EventComponent } from './event/event.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { CguComponent } from './pages/cgu/cgu.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PolitiqueComponent } from './pages/politique/politique.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'product/:id', component: ProductComponent },
  { path: 'product-list', component: ProductListComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'events', component: EventComponent },
  { path: 'event/:id', component: EventDetailComponent },
  { path: 'cgu', component: CguComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'politique', component: PolitiqueComponent },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'verify-otp',
    loadComponent: () =>
      import('./auth/verify-otp/verify-otp.component').then(
        (m) => m.VerifyOtpComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
