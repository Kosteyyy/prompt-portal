import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ProgressService } from '../../core/services/progress.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  template: `
    <h1>Профиль</h1>
    <p class="muted">{{ auth.user()?.email ?? 'Аккаунт' }}</p>

    <h2>Пройденные статьи</h2>
    <ul>
      <li *ngFor="let a of articles()">
        {{ a.articleSlug }} — {{ a.completedAt | date:'short' }}
      </li>
      <li *ngIf="articles().length === 0">Пока пусто</li>
    </ul>

    <h2>Попытки тестов</h2>
    <ul>
      <li *ngFor="let at of attempts()">
        {{ at.testId }} — {{ at.score }} / {{ at.maxScore }}
        ({{ at.createdAt | date:'short' }})
      </li>
      <li *ngIf="attempts().length === 0">Пока пусто</li>
    </ul>
  `,
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private progress = inject(ProgressService);

  articles = signal<any[]>([]);
  attempts = signal<any[]>([]);

  ngOnInit() {
    this.progress.getOverview().subscribe(res => {
      this.articles.set(res.articles);
      this.attempts.set(res.attempts);
    });
  }
}