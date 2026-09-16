import { Injectable, signal, computed } from '@angular/core';
import { ExerciseConfig, ExerciseResult } from '../models';

@Injectable({ providedIn: 'root' })
export class TestSessionService {
  readonly exercises = signal<ExerciseConfig[]>([]);
  readonly index = signal(0);
  readonly results = signal<ExerciseResult[]>([]);

  readonly total = computed(() => this.exercises().length);
  readonly current = computed(() => this.exercises()[this.index()] ?? null);
  readonly score = computed(() => this.results().reduce((s, r) => s + r.score, 0));
  readonly maxScore = computed(() =>
    this.exercises().reduce((s, e) => s + (e.weight ?? 1), 0));
  readonly finished = computed(() => this.index() >= this.total() && this.total() > 0);
  readonly answeredCurrent = computed(() =>
    this.results().some(r => r.exerciseId === this.current()?.id));

  start(exercises: ExerciseConfig[]) {
    this.exercises.set(exercises); this.index.set(0); this.results.set([]);
  }
  submit(r: ExerciseResult) { this.results.update(list => [...list, r]); }
  next() { this.index.update(i => i + 1); }
  reset() { this.index.set(0); this.results.set([]); }
}