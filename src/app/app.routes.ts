import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductComponent } from './product/product.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PolitiqueComponent } from './pages/politique/politique.component';
import { CguComponent } from './pages/cgu/cgu.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'product/:id', component: ProductComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'politique', component: PolitiqueComponent },
  { path: 'cgu', component: CguComponent },
];
