import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

// Services
import { Api_authService } from './services/api/api_auth.service';
import { Api_categoryService } from './services/api/api_category.service';
import { Api_eventService } from './services/api/api_event.service';
import { Api_itemService } from './services/api/api_item.service';
import { Api_paymentService } from './services/api/api_payment.service';
import { Api_registrationService } from './services/api/api_registration.service';
import { Api_userService } from './services/api/api_user.service';
import { CguComponent } from './pages/cgu/cgu.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PolitiqueComponent } from './pages/politique/politique.component';
import { ProductComponent } from './product/product.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    AppComponent,
    HeaderComponent,
    FooterComponent,
    CguComponent,
    ContactComponent,
    PolitiqueComponent,
    ProductComponent,
    HomeComponent,
  ],
  providers: [
    Api_authService,
    Api_categoryService,
    Api_eventService,
    Api_itemService,
    Api_paymentService,
    Api_registrationService,
    Api_userService,
    // Ajout de l'intercepteur pour ajouter le token d'authentification aux requêtes
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class AppModule {}
