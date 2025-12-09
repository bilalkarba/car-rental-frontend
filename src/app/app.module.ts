import { NgModule, PLATFORM_ID } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CarsComponent } from './pages/cars/cars.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AddCarComponent } from './admin-dashboard/add-car/add-car.component';
import { EditCarComponent } from './admin-dashboard/edit-car/edit-car.component';
import { AddAdminComponent } from './admin-dashboard/add-admin/add-admin.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LanguageSelectorComponent } from "./components/language-selector/language-selector.component";
import { TranslatePipe } from "./pipes/translate.pipe";
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentCancelComponent } from './pages/payment-cancel/payment-cancel.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardRealtimeComponent } from './pages/admin/dashboard-realtime/dashboard-realtime.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SuperAdminDashboardComponent } from './pages/super-admin/dashboard/super-admin-dashboard.component';
import { AgencyDetailsComponent } from './pages/super-admin/agency-details/agency-details.component';
import { NgChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [
    AppComponent,
    CarsComponent,
    CarDetailsComponent,
    DashboardComponent,
    PaymentComponent,
    PaymentSuccessComponent,
    PaymentCancelComponent,
    PaymentSuccessComponent,
    PaymentCancelComponent,
    DashboardRealtimeComponent,
    SuperAdminDashboardComponent,
    AgencyDetailsComponent
  
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,

    AddCarComponent,
    EditCarComponent,
    AddAdminComponent,
    LanguageSelectorComponent,
    TranslatePipe,
    LoginComponent,
    RegisterComponent,
    NotFoundComponent,
      NgChartsModule
],
  providers: [
     provideHttpClient(withFetch()),

    provideClientHydration(), 
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: PLATFORM_ID, useValue: 'browser' },
    DatePipe


  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
