import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  if (localStorage.getItem('pp_token')) return true;
  inject(Router).navigate(['/auth/login']);
  return false;
};