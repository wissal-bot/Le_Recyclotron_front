import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductComponent } from './product/product.component';
import { CguComponent } from './pages/cgu/cgu.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PolitiqueComponent } from './pages/politique/politique.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'product/:id', component: ProductComponent },
  { path: 'cgu', component: CguComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'politique', component: PolitiqueComponent },
  { path: '**', redirectTo: '' }, // Redirect to home for any unknown routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
