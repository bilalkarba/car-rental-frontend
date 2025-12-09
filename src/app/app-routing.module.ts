import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { CarsComponent } from './pages/cars/cars.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { AddCarComponent } from './admin-dashboard/add-car/add-car.component';
import { EditCarComponent } from './admin-dashboard/edit-car/edit-car.component';
import { AddAdminComponent } from './admin-dashboard/add-admin/add-admin.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentCancelComponent } from './pages/payment-cancel/payment-cancel.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DashboardRealtimeComponent } from './pages/admin/dashboard-realtime/dashboard-realtime.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SuperAdminDashboardComponent } from './pages/super-admin/dashboard/super-admin-dashboard.component';
import { AgencyDetailsComponent } from './pages/super-admin/agency-details/agency-details.component';
import { superAdminGuard } from './guards/super-admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cars', component: CarsComponent },
  { path: 'cars/:id', component: CarDetailsComponent , canActivate: [authGuard] },
  { path: 'admin-dashboard', component: DashboardRealtimeComponent , canActivate: [authGuard, adminGuard] },
  { path: 'add-car', component: AddCarComponent , canActivate: [authGuard, adminGuard] },
  { path: 'add-admin', component: AddAdminComponent , canActivate: [authGuard, adminGuard] },
  { path: 'dashboard', component: DashboardComponent , canActivate: [authGuard] },
  { path: 'dashboard-realtime', component: DashboardRealtimeComponent , canActivate: [authGuard, adminGuard] },
  { path: 'edit-car/:id', component: EditCarComponent , canActivate: [authGuard, adminGuard] },
  { path: 'payment', component: PaymentComponent , canActivate: [authGuard] },
  { path: 'payment-success', component: PaymentSuccessComponent , canActivate: [authGuard] },
  { path: 'payment-cancel', component: PaymentCancelComponent , canActivate: [authGuard] },
  { path: 'super-admin-dashboard', component: SuperAdminDashboardComponent, canActivate: [authGuard, superAdminGuard] },
  { path: 'super-admin/agency/:id', component: AgencyDetailsComponent, canActivate: [authGuard, superAdminGuard] },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
