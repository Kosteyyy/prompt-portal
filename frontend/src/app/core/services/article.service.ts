import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Article, Test } from '../models';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private api = inject(ApiService);
  list(course?: string) {
    return this.api.get<Article[]>('/articles', course ? { course } : undefined);
  }
  get(slug: string) { return this.api.get<Article>(`/articles/${slug}`); }
  getTest(id: string) { return this.api.get<Test>(`/tests/${id}`); }
}