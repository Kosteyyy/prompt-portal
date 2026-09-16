import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { ArticleService } from '../../core/services/article.service';
import { ProgressService } from '../../core/services/progress.service';
import { TestSessionService } from '../../core/services/test-session.service';
import { ExerciseHostComponent } from '../../exercises/exercise-host/exercise-host.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { ExerciseResult } from '../../core/models';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [NgIf, ExerciseHostComponent, ProgressBarComponent],
  template: `
    <div class="test">
      <header class="test__head">
        <app-progress-bar [value]="session.index()" [max]="session.total()" />
        <div class="test__counter">
          {{ session.index() + 1 }} / {{ session.total() }}
        </div>
      </header>

      <ng-container *ngIf="session.current() as ex; else finish">
        <app-exercise-host
          [config]="ex"
          mode="test"
          (answered)="onAnswered($event)" />
        <div class="actions">
          <button class="btn btn--primary"
            [disabled]="!session.answeredCurrent()"
            (click)="session.next()">Далее →</button>
        </div>
      </ng-container>

      <ng-template #finish>
        <div class="test__finish" *ngIf="session.finished()">
          <h2>Тест завершён</h2>
          <p>Ваш результат: {{ session.score() }} / {{ session.maxScore() }}</p>
          <button class="btn btn--primary" (click)="save()">Сохранить результат</button>
        </div>
      </ng-template>
    </div>
  `,
})
export class TestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private progress = inject(ProgressService);
  session = inject(TestSessionService);

  private testId = '';

  ngOnInit() {
    this.testId = this.route.snapshot.params['id'];
    this.session.reset();
    this.articleService.getTest(this.testId).subscribe(t => this.session.start(t.exercises));
  }

  onAnswered(r: ExerciseResult) { this.session.submit(r); }

  save() {
    this.progress.saveAttempt(this.testId, {
      answers: this.session.results(),
      score: this.session.score(),
      maxScore: this.session.maxScore(),
    }).subscribe(() => this.router.navigate(['/tests', this.testId, 'result']));
  }
}