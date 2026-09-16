import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { BaseExerciseComponent } from '../base-exercise.component';
import { FeedbackPanelComponent } from '../feedback-panel/feedback-panel.component';

@Component({
  selector: 'app-true-false',
  standalone: true,
  imports: [NgIf, FeedbackPanelComponent],
  template: `
    <p class="q">{{ config.question }}</p>
    <blockquote class="statement">{{ config.statement }}</blockquote>
    <div class="tf">
      <button [class.selected]="choice() === true"  (click)="choose(true)"  [disabled]="checked()">Верно</button>
      <button [class.selected]="choice() === false" (click)="choose(false)" [disabled]="checked()">Неверно</button>
    </div>
    <div class="actions">
      <button (click)="check()" [disabled]="choice() === null || checked()">Проверить</button>
      <button *ngIf="checked() && mode === 'inline'" (click)="retry()">Попробовать снова</button>
    </div>
    <app-feedback-panel *ngIf="checked()"
      [isCorrect]="score() === max" [partial]="false"
      [score]="score()" [maxScore]="max"
      [explanation]="config.explanation" />
  `,
})
export class TrueFalseComponent extends BaseExerciseComponent {
  choice = signal<boolean | null>(null);
  choose(v: boolean) { if (!this.checked()) this.choice.set(v); }
  check() { this.emitResult(this.choice() === this.config.correctBool ? this.max : 0, false); }
  retry() { this.choice.set(null); this.resetState(); }
}