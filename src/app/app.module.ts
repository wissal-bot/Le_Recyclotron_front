import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

// Services
import { Api_authService } from './services/api_auth.service';
import { Api_categoryService } from './services/api_category.service';
import { Api_eventService } from './services/api_event.service';
import { Api_itemService } from './services/api_item.service';
import { Api_paymentService } from './services/api_payment.service';
import { Api_registrationService } from './services/api_registration.service';
import { Api_userService } from './services/api_user.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    Api_authService,
    Api_categoryService,
    Api_eventService,
    Api_itemService,
    Api_paymentService,
    Api_registrationService,
    Api_userService
  ],
})
export class AppModule { }