import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.components';
import { ProductComponent } from '../product/product.components';
import { LoginComponent } from '../auth/login/login.components';
import { RegisterComponent } from '../auth/register/register.components';
import { ContactComponent } from '../pages/contact/contact.components';
import { PolitiqueComponent } from '../pages/politique/politique.components';
import { CguComponent } from '../pages/cgu/cgu.components';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'product/:id', component: ProductComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'politique', component: PolitiqueComponent },
  { path: 'cgu', component: CguComponent }
];