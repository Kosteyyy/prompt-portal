import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <h1>Создайте аккаунт, чтобы начать</h1>
    <p class="muted">Регистрация занимает 30 секунд. Прогресс сохраняется автоматически.</p>

    <ul class="perks">
      <li>Интерактивные упражнения прямо в тексте статей</li>
      <li>Автоматическое сохранение прогресса по курсам</li>
      <li>Итоговый тест с разбором ответов и историей попыток</li>
    </ul>

    <form (ngSubmit)="submit()" #f="ngForm">
      <label>
        Имя
        <input
          type="text"
          [(ngModel)]="name"
          name="name"
          required
          minlength="2"
          maxlength="50"
          placeholder="Как к вам обращаться"
        />
      </label>
      <label>
        Email
        <input type="email" [(ngModel)]="email" name="email" required />
      </label>
      <label>
        Пароль
        <input type="password" [(ngModel)]="password" name="password" required minlength="6" />
      </label>
      <button class="btn btn--primary" [disabled]="loading || f.invalid">
        {{ loading ? 'Создаём…' : 'Зарегистрироваться' }}
      </button>
      <p class="err" *ngIf="error">{{ error }}</p>
      <p>Уже есть аккаунт? <a routerLink="/auth/login">Войти</a></p>
    </form>
  `,
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  submit() {
    this.loading = true;
    this.error = '';
    this.auth.register(this.email, this.password, this.name).subscribe({
      next: () => this.router.navigate(['/courses']),
      error: (e) => {
        this.error = e?.error?.error || 'Ошибка регистрации';
        this.loading = false;
      },
    });
  }
}
