import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CarsComponent } from './pages/cars/cars.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AddCarComponent } from './admin-dashboard/add-car/add-car.component';
import { EditCarComponent } from './admin-dashboard/edit-car/edit-car.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentCancelComponent } from './pages/payment-cancel/payment-cancel.component';

const routes: Routes = [
  { path: '', redirectTo: 'cars', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cars', component: CarsComponent },
  { path: 'cars/:id', component: CarDetailsComponent , canActivate: [authGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent , canActivate: [authGuard, adminGuard] },
  { path: 'add-car', component: AddCarComponent , canActivate: [authGuard, adminGuard] },
  { path: 'edit-car/:id', component: EditCarComponent , canActivate: [authGuard, adminGuard] },
  { path: 'payment', component: PaymentComponent , canActivate: [authGuard] },
  { path: 'payment-success', component: PaymentSuccessComponent , canActivate: [authGuard] },
  { path: 'payment-cancel', component: PaymentCancelComponent , canActivate: [authGuard] },
  { path: '**', redirectTo: 'cars' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
