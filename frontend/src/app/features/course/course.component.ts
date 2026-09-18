import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ArticleService } from '../../core/services/article.service';
import { Article, Course } from '../../core/models';
import { CourseService } from '../../core/services/course.service';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [NgFor, RouterLink, NgIf],
  template: `
    <h1>{{ course()?.title ?? 'Загрузка…' }}</h1>
    <p *ngIf="course()?.description" class="course-description">
      {{ course()!.description }}
    </p>

    <ol class="article-list">
      <li *ngFor="let a of articles()">
        <a [routerLink]="['/articles', a.slug]">{{ a.title }}</a>
      </li>
    </ol>

    <a class="btn btn--primary" *ngIf="course()" [routerLink]="['/tests', course()!.testId]">
      Пройти итоговый тест
    </a>
  `,
})
export class CourseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private courseService = inject(CourseService);

  articles = signal<Article[]>([]);
  course = signal<Course | null>(null);

  ngOnInit() {
    const slug = this.route.snapshot.params['slug'];

    this.courseService.get(slug).subscribe((c) => this.course.set(c));
    this.articleService.list(slug).subscribe((a) => this.articles.set(a));
  }
}
