import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/models';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [NgFor, RouterLink],
  template: `
    <h1>Курс: {{ slug }}</h1>
    <ol class="article-list">
      <li *ngFor="let a of articles()">
        <a [routerLink]="['/articles', a.slug]">{{ a.title }}</a>
      </li>
    </ol>
    <a class="btn btn--primary" [routerLink]="['/tests', 'prompt-basics-test']">Пройти итоговый тест</a>
  `,
})
export class CourseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  articles = signal<Article[]>([]);
  slug = '';

  ngOnInit() {
    this.slug = this.route.snapshot.params['slug'];
    this.articleService.list(this.slug).subscribe(a => this.articles.set(a));
  }
}