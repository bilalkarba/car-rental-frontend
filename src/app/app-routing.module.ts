import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { superAdminGuard } from './guards/super-admin.guard';

const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'cars', 
    loadComponent: () => import('./pages/cars/cars.component').then(m => m.CarsComponent) 
  },
  { 
    path: 'cars/:id', 
    loadComponent: () => import('./pages/car-details/car-details.component').then(m => m.CarDetailsComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'admin-dashboard', 
    loadComponent: () => import('./pages/admin/dashboard-realtime/dashboard-realtime.component').then(m => m.DashboardRealtimeComponent),
    canActivate: [authGuard, adminGuard] 
  },
  { 
    path: 'add-car', 
    loadComponent: () => import('./admin-dashboard/add-car/add-car.component').then(m => m.AddCarComponent),
    canActivate: [authGuard, superAdminGuard] 
  },
  { 
    path: 'add-admin', 
    loadComponent: () => import('./admin-dashboard/add-admin/add-admin.component').then(m => m.AddAdminComponent),
    canActivate: [authGuard, adminGuard] 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'dashboard-realtime', 
    loadComponent: () => import('./pages/admin/dashboard-realtime/dashboard-realtime.component').then(m => m.DashboardRealtimeComponent),
    canActivate: [authGuard, adminGuard] 
  },
  { 
    path: 'edit-car/:id', 
    loadComponent: () => import('./admin-dashboard/edit-car/edit-car.component').then(m => m.EditCarComponent),
    canActivate: [authGuard, superAdminGuard] 
  },
  { 
    path: 'payment', 
    loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'payment-success', 
    loadComponent: () => import('./pages/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'payment-cancel', 
    loadComponent: () => import('./pages/payment-cancel/payment-cancel.component').then(m => m.PaymentCancelComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'super-admin-dashboard', 
    loadComponent: () => import('./pages/super-admin/dashboard/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent),
    canActivate: [authGuard, superAdminGuard] 
  },
  { 
    path: 'super-admin/agency/:id', 
    loadComponent: () => import('./pages/super-admin/agency-details/agency-details.component').then(m => m.AgencyDetailsComponent),
    canActivate: [authGuard, superAdminGuard] 
  },
  { 
    path: 'not-found', 
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) 
  },
  { 
    path: '**', 
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
