import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseExerciseComponent } from '../base-exercise.component';
import { FeedbackPanelComponent } from '../feedback-panel/feedback-panel.component';

@Component({
  selector: 'app-fill-the-blank',
  standalone: true,
  imports: [NgIf, FormsModule, FeedbackPanelComponent],
  template: `
    <p class="q">{{ config.question }}</p>
    <p class="sentence">
      {{ before() }}
      <input class="blank"
        [ngModel]="answer()"
        (ngModelChange)="answer.set($event)"
        [disabled]="checked()" />
      {{ after() }}
    </p>
    <div class="actions">
      <button (click)="check()" [disabled]="!answer().trim() || checked()">Проверить</button>
      <button *ngIf="checked() && mode === 'inline'" (click)="retry()">Попробовать снова</button>
    </div>
    <app-feedback-panel *ngIf="checked()"
      [isCorrect]="score() === max" [partial]="false"
      [score]="score()" [maxScore]="max"
      [explanation]="config.explanation" />
  `,
})
export class FillTheBlankComponent extends BaseExerciseComponent {
  answer = signal('');

  before() { return (this.config.sentence ?? '').split('{{blank}}')[0] ?? ''; }
  after() { return (this.config.sentence ?? '').split('{{blank}}')[1] ?? ''; }

  check() {
    const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
    const accepted = (this.config.acceptedAnswers ?? []).map(norm);
    this.emitResult(accepted.includes(norm(this.answer())) ? this.max : 0, false);
  }

  retry() { this.answer.set(''); this.resetState(); }
}