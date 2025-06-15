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
    path: 'events',
    loadComponent: () =>
      import('./event/event.component').then((m) => m.EventComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './event/components/event-calendar/event-calendar.component'
          ).then((m) => m.EventCalendarComponent),
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./event/components/event-detail/event-detail.component').then(
            (m) => m.EventDetailComponent
          ),
      },
      {
        path: 'register/:id',
        loadComponent: () =>
          import(
            './event/components/event-registration/event-registration.component'
          ).then((m) => m.EventRegistrationComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./event/components/event-create/event-create.component').then(
            (m) => m.EventCreateComponent
          ),
      },
      {
        path: 'update/:id',
        loadComponent: () =>
          import('./event/components/event-update/event-update.component').then(
            (m) => m.EventUpdateComponent
          ),
      },
      {
        path: 'delete/:id',
        loadComponent: () =>
          import('./event/components/event-delete/event-delete.component').then(
            (m) => m.EventDeleteComponent
          ),
      },
    ],
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
];
