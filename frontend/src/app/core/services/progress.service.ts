import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private api = inject(ApiService);
  getOverview() { return this.api.get<{ articles: any[]; attempts: any[] }>('/progress'); }
  markArticle(slug: string) { return this.api.post(`/progress/article/${slug}`, {}); }
  saveAttempt(testId: string, payload: any) { return this.api.post(`/progress/test/${testId}`, payload); }
}