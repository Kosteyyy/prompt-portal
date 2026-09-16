import { Component, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BaseExerciseComponent } from '../base-exercise.component';
import { FeedbackPanelComponent } from '../feedback-panel/feedback-panel.component';

@Component({
  selector: 'app-multiple-choice',
  standalone: true,
  imports: [NgFor, NgIf, FeedbackPanelComponent],
  template: `
    <p class="q">{{ config.question }}</p>
    <ul class="options">
      <li *ngFor="let opt of config.options" [class.selected]="selected().has(opt.id)">
        <label>
          <input [type]="config.multiple ? 'checkbox' : 'radio'"
                 [name]="config.id"
                 [checked]="selected().has(opt.id)"
                 (change)="toggle(opt.id)"
                 [disabled]="checked()" />
          <span>{{ opt.text }}</span>
        </label>
      </li>
    </ul>
    <div class="actions">
      <button (click)="check()" [disabled]="selected().size === 0 || checked()">Проверить</button>
      <button *ngIf="checked() && mode === 'inline'" (click)="retry()">Попробовать снова</button>
    </div>
    <app-feedback-panel *ngIf="checked()"
      [isCorrect]="score() === max" [partial]="false"
      [score]="score()" [maxScore]="max"
      [explanation]="config.explanation" />
  `,
})
export class MultipleChoiceComponent extends BaseExerciseComponent {
  selected = signal<Set<string>>(new Set());

  toggle(id: string) {
    if (this.checked()) return;
    const s = new Set(this.selected());
    if (this.config.multiple) s.has(id) ? s.delete(id) : s.add(id);
    else { s.clear(); s.add(id); }
    this.selected.set(s);
  }

  check() {
    const correct = new Set(this.config.correctOptions ?? []);
    const chosen = this.selected();
    const intersection = [...chosen].filter(x => correct.has(x)).length;
    const union = new Set([...chosen, ...correct]).size;
    const exact = intersection === union && union === correct.size;
    this.emitResult(exact ? this.max : 0, false);
  }

  retry() { this.selected.set(new Set()); this.resetState(); }
}