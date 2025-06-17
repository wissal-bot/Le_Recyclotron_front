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
            './event/components/event-registration-create/event-registration-create.component'
          ).then((m) => m.EventRegistrationCreateComponent),
      },
      {
        path: 'registration/detail/:id',
        loadComponent: () =>
          import(
            './event/components/event-registration-detail/event-registration-detail.component'
          ).then((m) => m.EventRegistrationDetailComponent),
      },
      {
        path: 'registration/update/:id',
        loadComponent: () =>
          import(
            './event/components/event-registration-update/event-registration-update.component'
          ).then((m) => m.EventRegistrationUpdateComponent),
      },
      {
        path: 'registration/delete/:id',
        loadComponent: () =>
          import(
            './event/components/event-registration-delete/event-registration-delete.component'
          ).then((m) => m.EventRegistrationDeleteComponent),
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
  {
    path: 'users',
    loadComponent: () =>
      import('./user/user.component').then((m) => m.UserComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user/components/user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./user/components/user-create/user-create.component').then(
            (m) => m.UserCreateComponent
          ),
      },
      {
        path: 'update/:id',
        loadComponent: () =>
          import('./user/components/user-update/user-update.component').then(
            (m) => m.UserUpdateComponent
          ),
      },
      {
        path: 'delete/:id',
        loadComponent: () =>
          import('./user/components/user-delete/user-delete.component').then(
            (m) => m.UserDeleteComponent
          ),
      },
    ],
  },
  {
    path: 'items',
    loadComponent: () =>
      import('./item/item.component').then((m) => m.ItemComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./item/components/item-list/item-list.component').then(
            (m) => m.ItemListComponent
          ),
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./item/components/item-detail/item-detail.component').then(
            (m) => m.ItemDetailComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./item/components/item-create/item-create.component').then(
            (m) => m.ItemCreateComponent
          ),
      },
      {
        path: 'update/:id',
        loadComponent: () =>
          import('./item/components/item-update/item-update.component').then(
            (m) => m.ItemUpdateComponent
          ),
      },
      {
        path: 'delete/:id',
        loadComponent: () =>
          import('./item/components/item-delete/item-delete.component').then(
            (m) => m.ItemDeleteComponent
          ),
      },
    ],
  },
  {
    path: 'repairer',
    loadComponent: () =>
      import('./repairer/repairer.component').then((m) => m.RepairerComponent),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./category/category.component').then((m) => m.CategoryComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './category/components/category-list/category-list.component'
          ).then((m) => m.CategoryListComponent),
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import(
            './category/components/category-detail/category-detail.component'
          ).then((m) => m.CategoryDetailComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './category/components/category-create/category-create.component'
          ).then((m) => m.CategoryCreateComponent),
      },
      {
        path: 'update/:id',
        loadComponent: () =>
          import(
            './category/components/category-update/category-update.component'
          ).then((m) => m.CategoryUpdateComponent),
      },
      {
        path: 'delete/:id',
        loadComponent: () =>
          import(
            './category/components/category-delete/category-delete.component'
          ).then((m) => m.CategoryDeleteComponent),
      },
    ],
  },
];
