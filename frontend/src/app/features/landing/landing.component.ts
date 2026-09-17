import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Промпт-инжиниринг: учись, практикуясь</h1>
      <p>Каждая концепция закрепляется интерактивным упражнением прямо в тексте.</p>
      <div class="actions">
        <a class="btn btn--primary"
           [routerLink]="auth.isAuthed ? '/courses' : '/auth/register'">
          {{ auth.isAuthed ? 'Продолжить обучение' : 'Начать бесплатно' }}
        </a>
        <a class="btn" routerLink="/courses">Все курсы</a>
      </div>
    </section>
  `,
})
export class LandingComponent {
  auth = inject(AuthService);
}