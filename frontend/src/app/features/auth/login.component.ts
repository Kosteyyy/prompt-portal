import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <h1>Вход</h1>
    <form (ngSubmit)="submit()" #f="ngForm">
      <label>Email <input type="email" [(ngModel)]="email" name="email" required></label>
      <label>Пароль <input type="password" [(ngModel)]="password" name="password" required></label>
      <button class="btn btn--primary" [disabled]="loading">Войти</button>
      <p class="err" *ngIf="error">{{ error }}</p>
      <p>Нет аккаунта? <a routerLink="/auth/register">Зарегистрироваться</a></p>
    </form>
  `,
})
export class LoginComponent {
  email = ''; password = ''; loading = false; error = '';
  private auth = inject(AuthService);
  private router = inject(Router);

  submit() {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/courses']),
      error: e => { this.error = e?.error?.error || 'Ошибка'; this.loading = false; },
    });
  }
}