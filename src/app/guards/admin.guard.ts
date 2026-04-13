import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Checking admin authentication...');
  console.log('Is logged in:', authService.isLogged());

  if (!authService.isLogged()) {
    console.log('User not logged in, redirecting to login...');
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getUser();
  console.log('User role:', user?.role);

  if (user && user.role === 'admin') {
    console.log('User is admin, access granted');
    return true;
  }

  console.log('User is not admin, redirecting to cars page...');
  router.navigate(['/cars']);
  return false;
};
