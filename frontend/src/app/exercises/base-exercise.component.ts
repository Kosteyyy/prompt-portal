import { Directive, EventEmitter, Input, Output, signal } from '@angular/core';
import { ExerciseConfig, ExerciseMode, ExerciseResult } from '../core/models';

@Directive()
export abstract class BaseExerciseComponent {
  @Input({ required: true }) config!: ExerciseConfig;
  @Input() mode: ExerciseMode = 'inline';
  @Output() answered = new EventEmitter<ExerciseResult>();

  readonly checked = signal(false);
  readonly score = signal(0);

  get max() { return this.config.weight ?? 1; }

  protected emitResult(score: number, partial = false) {
    const s = Math.round(score * 100) / 100;
    this.score.set(s);
    this.checked.set(true);
    this.answered.emit({
      exerciseId: this.config.id,
      score: s, maxScore: this.max,
      isCorrect: s === this.max, partial,
    });
  }

  protected resetState() { this.checked.set(false); this.score.set(0); }
}