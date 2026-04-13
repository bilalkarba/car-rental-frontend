import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('Checking authentication...');
  console.log('Is logged in:', authService.isLogged());
  
  if (authService.isLogged()) {
    return true;
  }
  
  console.log('Redirecting to login...');
  router.navigate(['/login']);
  return false;
};
