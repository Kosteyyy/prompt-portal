import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-feedback-panel',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="feedback"
      [class.feedback--ok]="isCorrect"
      [class.feedback--partial]="!isCorrect && partial"
      [class.feedback--bad]="!isCorrect && !partial">
      <div class="feedback__title">
        {{ isCorrect ? '✓ Верно' : partial ? '◐ Частично верно' : '✗ Неверно' }}
        — {{ score }} / {{ maxScore }}
      </div>
      <div class="feedback__body" *ngIf="explanation">{{ explanation }}</div>
    </div>
  `,
})
export class FeedbackPanelComponent {
  @Input() isCorrect = false;
  @Input() partial = false;
  @Input() score = 0;
  @Input() maxScore = 1;
  @Input() explanation?: string;
}