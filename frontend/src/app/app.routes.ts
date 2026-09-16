import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'courses', loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent) },
  { path: 'courses/:slug', loadComponent: () => import('./features/course/course.component').then(m => m.CourseComponent) },
  { path: 'articles/:slug', loadComponent: () => import('./features/article/article.component').then(m => m.ArticleComponent) },
  { path: 'tests/:id', canActivate: [authGuard], loadComponent: () => import('./features/test/test.component').then(m => m.TestComponent) },
  { path: 'tests/:id/result', canActivate: [authGuard], loadComponent: () => import('./features/test-result/test-result.component').then(m => m.TestResultComponent) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
  { path: '**', redirectTo: '' },
];