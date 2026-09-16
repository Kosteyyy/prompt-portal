import { Component, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseExerciseComponent } from '../base-exercise.component';
import { FeedbackPanelComponent } from '../feedback-panel/feedback-panel.component';

@Component({
  selector: 'app-prompt-builder',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, FeedbackPanelComponent],
  template: `
    <p class="q">{{ config.question }}</p>
    <div class="builder">
      <div *ngFor="let s of config.suggestions" class="builder__row">
        <span class="builder__text">{{ s.text }}</span>
        <select
          [ngModel]="assignments()[s.id] || ''"
          (ngModelChange)="setAssignment(s.id, $event)"
          [disabled]="checked()">
          <option value="">— блок —</option>
          <option *ngFor="let slot of config.slots" [value]="slot.id">{{ slot.label }}</option>
        </select>
      </div>
    </div>
    <div class="actions">
      <button (click)="check()" [disabled]="checked()">Проверить</button>
      <button *ngIf="checked() && mode === 'inline'" (click)="retry()">Попробовать снова</button>
    </div>
    <app-feedback-panel *ngIf="checked()"
      [isCorrect]="score() === max"
      [partial]="score() > 0 && score() < max"
      [score]="score()" [maxScore]="max"
      [explanation]="config.explanation" />
  `,
})
export class PromptBuilderComponent extends BaseExerciseComponent {
  assignments = signal<Record<string, string>>({});

  setAssignment(suggestionId: string, slotId: string) {
    if (this.checked()) return;
    const next = { ...this.assignments() };
    if (slotId) next[suggestionId] = slotId;
    else delete next[suggestionId];
    this.assignments.set(next);
  }

  check() {
    const expected = this.config.correctAssignments ?? {};
    const keys = Object.keys(expected);
    let correct = 0;
    for (const k of keys) if (this.assignments()[k] === expected[k]) correct++;
    const total = keys.length || 1;
    this.emitResult((correct / total) * this.max, correct > 0 && correct < total);
  }

  retry() { this.assignments.set({}); this.resetState(); }
}