import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Course } from '../models';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private api = inject(ApiService);

  list() {
    return this.api.get<Course[]>('/courses');
  }

  get(slug: string) {
    return this.api.get<Course>(`/courses/${slug}`);
  }
}