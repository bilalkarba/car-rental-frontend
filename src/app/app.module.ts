import { NgModule, PLATFORM_ID } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CarsComponent } from './pages/cars/cars.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';

import { AddCarComponent } from './admin-dashboard/add-car/add-car.component';
import { EditCarComponent } from './admin-dashboard/edit-car/edit-car.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LanguageSelectorComponent } from "./components/language-selector/language-selector.component";
import { TranslatePipe } from "./pipes/translate.pipe";
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentCancelComponent } from './pages/payment-cancel/payment-cancel.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';


@NgModule({
  declarations: [
    AppComponent,
    CarsComponent,
    CarDetailsComponent,
    DashboardComponent,
    PaymentComponent,
    PaymentSuccessComponent,
    PaymentCancelComponent
  
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    AdminDashboardComponent,
    AddCarComponent,
    EditCarComponent,
    LanguageSelectorComponent,
    TranslatePipe,
    LoginComponent,
    RegisterComponent
    
],
  providers: [
     provideHttpClient(withFetch()),

    provideClientHydration(withEventReplay()), 
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: PLATFORM_ID, useValue: 'browser' },
    DatePipe


  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
