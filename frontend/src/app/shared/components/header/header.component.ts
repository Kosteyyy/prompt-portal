import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  template: `
    <header class="header">
      <a routerLink="/" class="header__logo">PromptPortal</a>
      <nav class="header__nav">
        <a routerLink="/courses" routerLinkActive="active">Курсы</a>
        <a *ngIf="auth.isAuthed" routerLink="/profile" routerLinkActive="active">Профиль</a>
        <a *ngIf="!auth.isAuthed" routerLink="/auth/login">Войти</a>
        <button *ngIf="auth.isAuthed" (click)="logout()">Выйти</button>
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  logout() { this.auth.logout(); this.router.navigate(['/']); }
}