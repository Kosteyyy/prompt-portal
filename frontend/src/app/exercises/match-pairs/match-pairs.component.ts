import { Component, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BaseExerciseComponent } from '../base-exercise.component';
import { FeedbackPanelComponent } from '../feedback-panel/feedback-panel.component';

@Component({
  selector: 'app-match-pairs',
  standalone: true,
  imports: [NgFor, NgIf, FeedbackPanelComponent],
  template: `
    <p class="q">{{ config.question }}</p>
    <div class="match">
      <div class="match__col">
        <button *ngFor="let p of config.pairs" type="button" class="match__item"
          [class.selected]="activeLeft() === p.id"
          [class.matched]="rightFor(p.id)"
          [disabled]="checked()"
          (click)="pickLeft(p.id)">
          <span>{{ p.left }}</span>
          <small *ngIf="rightFor(p.id)">→ {{ rightLabel(rightFor(p.id)!) }}</small>
        </button>
      </div>
      <div class="match__col">
        <button *ngFor="let r of shuffledRights()" type="button" class="match__item"
          [class.used]="isRightUsed(r.id)"
          [disabled]="checked() || isRightUsed(r.id)"
          (click)="pickRight(r.id)">
          {{ r.text }}
        </button>
      </div>
    </div>
    <div class="actions">
      <button (click)="check()" [disabled]="!allMatched() || checked()">Проверить</button>
      <button *ngIf="checked() && mode === 'inline'" (click)="retry()">Попробовать снова</button>
    </div>
    <app-feedback-panel *ngIf="checked()"
      [isCorrect]="score() === max"
      [partial]="score() > 0 && score() < max"
      [score]="score()" [maxScore]="max"
      [explanation]="config.explanation" />
  `,
})
export class MatchPairsComponent extends BaseExerciseComponent implements OnInit {
  pairs = signal<Map<string, string>>(new Map());
  activeLeft = signal<string | null>(null);
  shuffledRights = signal<{ id: string; text: string }[]>([]);

  ngOnInit() {
    const rights = (this.config.pairs ?? []).map(p => ({ id: p.id, text: p.right }));
    this.shuffledRights.set(shuffle(rights));
  }

  rightFor(leftId: string) { return this.pairs().get(leftId) ?? null; }
  rightLabel(rightId: string) {
    return this.config.pairs?.find(p => p.id === rightId)?.right ?? '';
  }
  isRightUsed(rightId: string) { return [...this.pairs().values()].includes(rightId); }

  pickLeft(id: string) {
    if (this.checked()) return;
    this.activeLeft.set(this.activeLeft() === id ? null : id);
  }

  pickRight(id: string) {
    const left = this.activeLeft();
    if (!left || this.checked()) return;
    const next = new Map(this.pairs());
    next.delete(left);
    for (const [k, v] of [...next.entries()]) if (v === id) next.delete(k);
    next.set(left, id);
    this.pairs.set(next);
    this.activeLeft.set(null);
  }

  allMatched() { return this.pairs().size === (this.config.pairs?.length ?? 0); }

  check() {
    const total = this.config.pairs?.length ?? 0;
    let correct = 0;
    for (const p of this.config.pairs ?? []) if (this.pairs().get(p.id) === p.id) correct++;
    this.emitResult(total ? (correct / total) * this.max : 0, correct > 0 && correct < total);
  }

  retry() {
    this.pairs.set(new Map());
    this.activeLeft.set(null);
    this.resetState();
  }
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }