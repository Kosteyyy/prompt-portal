import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ArticleService } from '../../core/services/article.service';
import { ProgressService } from '../../core/services/progress.service';
import { ExerciseHostComponent } from '../../exercises/exercise-host/exercise-host.component';
import { Article, Block, ExerciseResult } from '../../core/models';

type TextBlock = Extract<Block, { type: 'text' }>;
type CodeBlock = Extract<Block, { type: 'code' }>;
type ImageBlock = Extract<Block, { type: 'image' }>;
type ExerciseBlock = Extract<Block, { type: 'exercise' }>;

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, ExerciseHostComponent, RouterLink],
  template: `
    <article class="article" *ngIf="article() as a; else loading">
      <h1>{{ a.title }}</h1>
      <p class="article__summary" *ngIf="a.summary">{{ a.summary }}</p>

      <ng-container
        *ngFor="let block of a.blocks; let i = index; trackBy: trackBlock"
        [ngSwitch]="block.type"
      >
        <p *ngSwitchCase="'text'" [innerHTML]="asText(block).md"></p>
        <pre *ngSwitchCase="'code'"><code>{{ asCode(block).code }}</code></pre>
        <img *ngSwitchCase="'image'" [src]="asImage(block).url" [alt]="asImage(block).alt" />
        <app-exercise-host
          *ngSwitchCase="'exercise'"
          [config]="asExercise(block).config"
          mode="inline"
          (answered)="onAnswered(i, $event)"
        />
      </ng-container>

      <footer class="article__footer">
        <button class="btn" (click)="complete()" [disabled]="completed()">
          {{ completed() ? 'Отмечено ✓' : 'Отметить как прочитанное' }}
        </button>
        <a class="btn btn--primary" [routerLink]="['/tests', a.testId]">Перейти к тесту →</a>
      </footer>
    </article>
    <ng-template #loading><p>Загрузка…</p></ng-template>
  `,
})
export class ArticleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private progress = inject(ProgressService);

  article = signal<Article | null>(null);
  completed = signal(false);

  asText(b: Block) {
    return b as TextBlock;
  }
  asCode(b: Block) {
    return b as CodeBlock;
  }
  asImage(b: Block) {
    return b as ImageBlock;
  }
  asExercise(b: Block) {
    return b as ExerciseBlock;
  }

  trackBlock(i: number, b: Block) {
    return b.type + i;
  }

  ngOnInit() {
    const slug = this.route.snapshot.params['slug'];
    this.articleService.get(slug).subscribe((a) => this.article.set(a));
  }

  onAnswered(_idx: number, _res: ExerciseResult) {
    /* inline — просто визуальный фидбэк */
  }

  complete() {
    const slug = this.route.snapshot.params['slug'];
    this.progress.markArticle(slug).subscribe(() => this.completed.set(true));
  }
}
