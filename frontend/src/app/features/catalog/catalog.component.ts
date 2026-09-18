import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Курсы</h1>
    <div class="grid">
      <a class="card" routerLink="/courses/prompt-engineering">
        <h3>Промпт-инжиниринг: практика</h3>
        <p>Интуиция о LLM, структура промпта, роль и контекст.</p>
      </a>
    </div>
  `,
})
export class CatalogComponent implements OnInit {
  articleService = inject(ArticleService);
  ngOnInit() { /* при желании — загрузка списка курсов */ }
}