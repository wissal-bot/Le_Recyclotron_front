import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./product/product.component').then((m) => m.ProductComponent),
  },
  {
    path: 'product-list',
    loadComponent: () =>
      import('./product-list/product-list.component').then(
        (m) => m.ProductListComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'event',
    loadComponent: () =>
      import('./event/event.component').then((m) => m.EventComponent),
  },
  {
    path: 'event/:id',
    loadComponent: () =>
      import('./event-detail/event-detail.component').then(
        (m) => m.EventDetailComponent
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./payment/payment.component').then((m) => m.PaymentComponent),
  },
  {
    path: 'cgu',
    loadComponent: () =>
      import('./pages/cgu/cgu.component').then((m) => m.CguComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
  },
  {
    path: 'politique',
    loadComponent: () =>
      import('./pages/politique/politique.component').then(
        (m) => m.PolitiqueComponent
      ),
  },
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
  {
<<<<<<< HEAD
    // path: 'dashboardUser',
    // loadComponent: () =>
    //   // import('./user/dashboard-user/user.component').then(
    //     (m) => m.UserComponent
    //   ),
  },
  { path: '**', redirectTo: '' }, // Add a wildcard route
=======
    path: '**',
    redirectTo: '',
  },
>>>>>>> 4febef04398ae804b3a1676611e42bf64c9a2e6e
];
