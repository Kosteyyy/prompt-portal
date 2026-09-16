import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TestSessionService } from '../../core/services/test-session.service';

@Component({
  selector: 'app-test-result',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <section class="result" *ngIf="session.total() > 0; else empty">
      <h1>Результат</h1>
      <div class="result__score">
        {{ session.score() }} / {{ session.maxScore() }}
        ({{ percent() }}%)
      </div>
      <ul class="result__list">
        <li *ngFor="let r of session.results()"
          [class.ok]="r.isCorrect" [class.partial]="r.partial && !r.isCorrect"
          [class.bad]="!r.isCorrect && !r.partial">
          {{ r.exerciseId }} — {{ r.score }} / {{ r.maxScore }}
        </li>
      </ul>
      <div class="actions">
        <a class="btn" routerLink="/courses">К курсам</a>
        <a class="btn btn--primary" routerLink="/profile">Профиль</a>
      </div>
    </section>
    <ng-template #empty><p>Нет данных. <a routerLink="/courses">К курсам</a></p></ng-template>
  `,
})
export class TestResultComponent {
  session = inject(TestSessionService);
  percent() {
    const max = this.session.maxScore();
    return max ? Math.round((this.session.score() / max) * 100) : 0;
  }
}