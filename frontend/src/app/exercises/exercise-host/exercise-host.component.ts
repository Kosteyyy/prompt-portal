import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { ExerciseConfig, ExerciseMode, ExerciseResult } from '../../core/models';
import { MultipleChoiceComponent } from '../multiple-choice/multiple-choice.component';
import { MatchPairsComponent } from '../match-pairs/match-pairs.component';
import { FillTheBlankComponent } from '../fill-the-blank/fill-the-blank.component';
import { TrueFalseComponent } from '../true-false/true-false.component';
import { OrderStepsComponent } from '../order-steps/order-steps.component';
import { PromptBuilderComponent } from '../prompt-builder/prompt-builder.component';

@Component({
  selector: 'app-exercise-host',
  standalone: true,
  imports: [
    NgSwitch, NgSwitchCase,
    MultipleChoiceComponent, MatchPairsComponent, FillTheBlankComponent,
    TrueFalseComponent, OrderStepsComponent, PromptBuilderComponent,
  ],
  template: `
    <section class="exercise" [attr.data-type]="config.type">
      <div class="exercise__badge">{{ label }}</div>
      <ng-container [ngSwitch]="config.type">
        <app-multiple-choice *ngSwitchCase="'multiple-choice'" [config]="config" [mode]="mode" (answered)="answered.emit($event)" />
        <app-match-pairs     *ngSwitchCase="'match-pairs'"     [config]="config" [mode]="mode" (answered)="answered.emit($event)" />
        <app-fill-the-blank  *ngSwitchCase="'fill-the-blank'"  [config]="config" [mode]="mode" (answered)="answered.emit($event)" />
        <app-true-false      *ngSwitchCase="'true-false'"      [config]="config" [mode]="mode" (answered)="answered.emit($event)" />
        <app-order-steps     *ngSwitchCase="'order-steps'"     [config]="config" [mode]="mode" (answered)="answered.emit($event)" />
        <app-prompt-builder  *ngSwitchCase="'prompt-builder'"  [config]="config" [mode]="mode" (answered)="answered.emit($event)" />
      </ng-container>
    </section>
  `,
})
export class ExerciseHostComponent {
  @Input({ required: true }) config!: ExerciseConfig;
  @Input() mode: ExerciseMode = 'inline';
  @Output() answered = new EventEmitter<ExerciseResult>();

  get label() {
    return {
      'multiple-choice': 'Выбор ответа',
      'match-pairs': 'Соединить пары',
      'fill-the-blank': 'Заполнить пропуск',
      'true-false': 'Верно / неверно',
      'order-steps': 'Порядок шагов',
      'prompt-builder': 'Собери промпт',
    }[this.config.type];
  }
}