import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ArticleService } from '../../core/services/article.service';
import { CourseService } from '../../core/services/course.service';
import { ProgressService } from '../../core/services/progress.service';
import { ExerciseHostComponent } from '../../exercises/exercise-host/exercise-host.component';
import { Article, Block, Course, ExerciseResult } from '../../core/models';

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
      <nav class="article__breadcrumb" *ngIf="course() as c">
        <a [routerLink]="['/courses', c.slug]">← {{ c.title }}</a>
      </nav>

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

      <nav class="article__pager" *ngIf="prev() || next()">
        <a
          *ngIf="prev() as p"
          class="article__pager-link article__pager-link--prev"
          [routerLink]="['/articles', p.slug]"
        >
          ← {{ p.title }}
        </a>
        <span *ngIf="!prev()"></span>
        <a
          *ngIf="next() as n"
          class="article__pager-link article__pager-link--next"
          [routerLink]="['/articles', n.slug]"
        >
          {{ n.title }} →
        </a>
      </nav>

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
  private courseService = inject(CourseService);
  private progress = inject(ProgressService);

  article = signal<Article | null>(null);
  course = signal<Course | null>(null);
  articles = signal<Article[]>([]);
  completed = signal(false);

  prev = computed(() => this.neighbor(-1));
  next = computed(() => this.neighbor(+1));

  private neighbor(offset: number): Article | null {
    const current = this.article();
    if (!current) return null;
    const list = this.articles();
    const idx = list.findIndex((x) => x.slug === current.slug);
    if (idx === -1) return null;
    return list[idx + offset] ?? null;
  }

  asText(b: Block) { return b as TextBlock; }
  asCode(b: Block) { return b as CodeBlock; }
  asImage(b: Block) { return b as ImageBlock; }
  asExercise(b: Block) { return b as ExerciseBlock; }

  trackBlock(i: number, b: Block) { return b.type + i; }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) return;

      this.article.set(null);
      this.course.set(null);
      this.articles.set([]);
      this.completed.set(false);

      this.articleService.get(slug).subscribe((a) => {
        this.article.set(a);

        this.courseService.get(a.courseSlug).subscribe((c) => {
          this.course.set(c);

          this.articleService.list(a.courseSlug).subscribe((list) => {
            // Сортируем по порядку из course.articles, а не по порядку в JSON.
            const order = c.articles ?? [];
            const rank = (s: string) => {
              const i = order.indexOf(s);
              return i === -1 ? Number.MAX_SAFE_INTEGER : i;
            };
            this.articles.set([...list].sort((x, y) => rank(x.slug) - rank(y.slug)));
          });
        });
      });
    });
  }

  onAnswered(_idx: number, _res: ExerciseResult) {
    /* inline — просто визуальный фидбэк */
  }

  complete() {
    const slug = this.route.snapshot.params['slug'];
    this.progress.markArticle(slug).subscribe(() => this.completed.set(true));
  }
}