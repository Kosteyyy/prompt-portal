import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('pp_token');
  const isPublicAuth =
    req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (token && !isPublicAuth) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};