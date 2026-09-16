import { Component, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BaseExerciseComponent } from '../base-exercise.component';
import { FeedbackPanelComponent } from '../feedback-panel/feedback-panel.component';

@Component({
  selector: 'app-order-steps',
  standalone: true,
  imports: [NgFor, NgIf, FeedbackPanelComponent],
  template: `
    <p class="q">{{ config.question }}</p>
    <ol class="order">
      <li *ngFor="let item of items(); let i = index">
        <span>{{ item.text }}</span>
        <span class="order__controls">
          <button (click)="move(i, -1)" [disabled]="i === 0 || checked()">↑</button>
          <button (click)="move(i, 1)" [disabled]="i === items().length - 1 || checked()">↓</button>
        </span>
      </li>
    </ol>
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
export class OrderStepsComponent extends BaseExerciseComponent implements OnInit {
  items = signal<{ id: string; text: string }[]>([]);

  ngOnInit() { this.items.set(shuffle([...(this.config.items ?? [])])); }

  move(i: number, delta: number) {
    if (this.checked()) return;
    const list = [...this.items()];
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    this.items.set(list);
  }

  check() {
    const order = this.config.correctOrder ?? [];
    const list = this.items();
    let correct = 0;
    for (let i = 0; i < order.length; i++) if (list[i]?.id === order[i]) correct++;
    const total = order.length || 1;
    this.emitResult((correct / total) * this.max, correct > 0 && correct < total);
  }

  retry() { this.items.set(shuffle([...(this.config.items ?? [])])); this.resetState(); }
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }