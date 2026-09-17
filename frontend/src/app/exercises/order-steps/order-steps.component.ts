import { Component, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BaseExerciseComponent } from '../base-exercise.component';
import { FeedbackPanelComponent } from '../feedback-panel/feedback-panel.component';

interface OrderItem {
  id: string;
  text: string;
}

@Component({
  selector: 'app-order-steps',
  standalone: true,
  imports: [NgFor, NgIf, FeedbackPanelComponent],
  template: `
    <p class="q">{{ config.question }}</p>

    <ol class="order">
      <li
        *ngFor="let item of items(); let i = index"
        class="order__item"
        [attr.draggable]="checked() ? 'false' : 'true'"
        [class.is-dragging]="dragIndex() === i"
        [class.is-over]="overIndex() === i && dragIndex() !== i"
        (dragstart)="onDragStart(i, $event)"
        (dragover)="onDragOver(i, $event)"
        (dragleave)="onDragLeave(i, $event)"
        (drop)="onDrop(i, $event)"
        (dragend)="onDragEnd()"
      >
        <span class="order__grip" aria-hidden="true">⠿</span>
        <span class="order__text">{{ item.text }}</span>
        <span class="order__controls">
          <button type="button" (click)="move(i, -1)" [disabled]="i === 0 || checked()">↑</button>
          <button type="button" (click)="move(i, 1)" [disabled]="i === items().length - 1 || checked()">↓</button>
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
  styles: [`
    .order__item {
      display: flex;
      align-items: center;
      gap: .5rem;
      cursor: grab;
      user-select: none;
      transition: opacity .15s ease, transform .15s ease;
    }
    .order__item[draggable='false'] { cursor: default; }
    .order__item.is-dragging { opacity: .4; cursor: grabbing; }
    .order__item.is-over { outline: 2px dashed currentColor; outline-offset: 2px; }
    .order__grip { opacity: .5; }
    .order__text { flex: 1 1 auto; }
    .order__controls { display: inline-flex; gap: .25rem; }
  `],
})
export class OrderStepsComponent extends BaseExerciseComponent implements OnInit {
  items = signal<OrderItem[]>([]);

  /** Индекс элемента, который сейчас тащат */
  dragIndex = signal<number | null>(null);
  /** Индекс элемента, над которым сейчас находится курсор */
  overIndex = signal<number | null>(null);

  ngOnInit() {
    this.items.set(shuffle([...(this.config.items ?? [])]));
  }

  // ---------- Кнопки (доступность / тач-устройства) ----------

  move(i: number, delta: number) {
    if (this.checked()) return;
    const list = [...this.items()];
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    this.items.set(list);
  }

  // ---------- Drag & Drop ----------

  onDragStart(index: number, event: DragEvent) {
    if (this.checked()) {
      event.preventDefault();
      return;
    }
    this.dragIndex.set(index);
    this.overIndex.set(null);

    // Firefox без setData не начинает drag
    event.dataTransfer?.setData('text/plain', String(index));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(index: number, event: DragEvent) {
    if (this.dragIndex() === null) return;
    // без preventDefault браузер не разрешит drop
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    if (this.overIndex() !== index) this.overIndex.set(index);
  }

  onDragLeave(index: number, event: DragEvent) {
    // dragleave срабатывает и при переходе на дочерние элементы — игнорируем такие случаи
    const li = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node | null;
    if (related && li.contains(related)) return;
    if (this.overIndex() === index) this.overIndex.set(null);
  }

  onDrop(targetIndex: number, event: DragEvent) {
    event.preventDefault();
    const from = this.dragIndex();
    this.onDragEnd();
    if (from === null || from === targetIndex) return;

    const list = [...this.items()];
    const [moved] = list.splice(from, 1);
    list.splice(targetIndex, 0, moved);
    this.items.set(list);
  }

  onDragEnd() {
    this.dragIndex.set(null);
    this.overIndex.set(null);
  }

  // ---------- Проверка ----------

  check() {
    const order = this.config.correctOrder ?? [];
    const list = this.items();
    let correct = 0;
    for (let i = 0; i < order.length; i++) {
      if (list[i]?.id === order[i]) correct++;
    }
    const total = order.length || 1;
    this.emitResult((correct / total) * this.max, correct > 0 && correct < total);
  }

  retry() {
    this.onDragEnd();
    this.items.set(shuffle([...(this.config.items ?? [])]));
    this.resetState();
  }
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}